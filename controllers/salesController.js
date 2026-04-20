import context from '../context/AppContext.js';
import path from 'path'
import fs from 'fs'
const { Sequelize } = context
import { Op, fn, col, literal } from 'sequelize';

export async function GetAll(req, res, next) {
    const companyId = req.user.companyId

    const startOfMonth = new Date();
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setDate(1);

    try {
        const [sales, salesStats, monthlySalesCount, investmentStats, purchasesList] = await Promise.all([
            context.SalesModel.findAll({
                where: { companyId },
                order: [['createdAt', 'DESC']],
                include: [{ model: context.ProductsModel, as: 'Product', attributes: ['name'], required: false }]
            }),

            context.SalesModel.findOne({
                where: { companyId, isCompleted: true },
                attributes: [
                    [fn('COUNT', col('id')), 'totalCompletedSales'],
                    [fn('SUM', col('totalPrice')), 'totalRevenue']
                ],
                raw: true
            }),

            context.SalesModel.count({
                where: { companyId, createdAt: { [Op.gte]: startOfMonth } }
            }),

            context.InventoryMovementsModel.findOne({
                where: { 
                    companyId, 
                    movementType: 'IN' 
                },
                attributes: [
                    [
                        fn('SUM', literal('quantity * costPriceAtMovement')), 
                        'totalInvestment'
                    ]
                ],
                raw: true
            }),

            context.InventoryMovementsModel.findAll({
                where: { companyId, movementType: 'IN' },
                order: [['createdAt', 'DESC']],
                include: [{
                    model: context.ProductsModel,
                    as: 'Product',
                    attributes: ['name']
                }],
                attributes: [
                    'id', 'quantity', 'createdAt', 'costPriceAtMovement',
                    [literal('quantity * costPriceAtMovement'), 'totalCost']
                ]
            })
        ]);

        const revenue = parseFloat(salesStats.totalRevenue) || 0;
        const investment = parseFloat(investmentStats.totalInvestment) || 0;
        const netProfit = revenue - investment;

        if (sales.length === 0 && purchasesList.length === 0) {
            return res.status(204).end();
        }

        res.status(200).json({ 
            message: "Financial data retrieved successfully.", 
            data: {
                sales: sales,
                purchases: purchasesList, 
                stats: {
                    totalCompletedSales: parseInt(salesStats.totalCompletedSales) || 0,
                    totalRevenue: revenue,
                    totalInvestment: investment,
                    netProfit: netProfit,
                    currentMonthSalesCount: monthlySalesCount,
                    status: netProfit >= 0 ? 'PROFIT' : 'LOSS'
                }
            }
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function GetById(req, res, next) {
    const { saleId } = req.params;
    const companyId = req.user.companyId

    try {
        const sale = await context.SalesModel.findOne({
            where: {
                id: saleId,
                companyId: companyId
            },
            include: [{
                model: context.ProductsModel,
                as: 'Product',
                where: {
                    isActive: true
                },
                required: false,
                attributes: [
                    'name',
                ]
            }]
        });

        if (!sale) {
            const error = new Error("Sale not found or is not associated with your company.");
            error.statusCode = 404;
            error.data = { saleId: saleId };
            throw error;
        }

        res.status(200).json({
            message: "Sale retrieved successfully.",
            data: sale
        })

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function CreateSale(req, res, next) {
    const {
        productId,
        quantity,
        clientName,
        paymentMethod,
        registerDate,
    } = req.body

    let transaction = null

    const companyId = req.user.companyId
    const requesterId = req.user.id

    try{
        const [companyExists, product] = await Promise.all([
            context.CompaniesModel.findByPk(companyId),
            context.ProductsModel.findOne({
                where: {
                    companyId: companyId,
                    id: productId,
                    isActive: true
                }
            })
        ]);

        if (!companyExists) {
            const error = new Error("The linked company is not valid.");
            error.statusCode = 404;
            throw error;
        }

        if (!product){
            const error = new Error("Product not found or is not associated with your company.");
            error.statusCode = 404;
            throw error;
        }

        const productRemainingStock = product.currentStock - quantity

        if(productRemainingStock < 0){
            const error = new Error("Insufficient stock. It cannot go below 0.");
            error.statusCode = 400;
            error.data = { productId: productId, productCurrentStock: product.currentStock,  productRemainingStock: productRemainingStock, productMinStock: product.minStock };
            throw error; 
        }

        const totalPrice = quantity * product.price

        
        transaction = await context.Sequelize.transaction();

        //Sale code creation
        const saleCodePrefix = product.name.replace(/\s+/g, '').substring(0, 3).toUpperCase();

        const lastSale = await context.SalesModel.findOne({
            where: {
                companyId: companyId,
                code: { [Op.like]: `${saleCodePrefix}-%` }
            },
            order: [['createdAt', 'DESC']],
            transaction
        });

        let nextNumber = 1;
        if (lastSale && lastSale.code) {
            const lastNumber = parseInt(lastSale.code.split('-')[1]);
            nextNumber = lastNumber + 1
        }

        const saleCode = `${saleCodePrefix}-${nextNumber.toString().padStart(3, '0')}`;
        //

        const newSale = await context.SalesModel.create({
            productId: product.id,
            code: saleCode,
            clientName: clientName,
            quantity: quantity,
            totalPrice: totalPrice,
            paymentMethod: paymentMethod,
            registerDate: registerDate,
            companyId: companyId,
            isCompleted: false,
        }, { transaction })

        await context.InventoryMovementsModel.create({
            productId: product.id,
            movementType: 'OUT',
            quantity: quantity,
            previousStock: product.currentStock,
            costPriceAtMovement: product.costPrice,
            newStock: productRemainingStock,
            userId: requesterId,
            reference: `Sale ${saleCode}`,
            saleId: newSale.id,
            companyId: companyId
        }, { transaction }); 

        await context.ProductsModel.update({
            currentStock: productRemainingStock
            },{ where: {
                id: product.id, 
                companyId: companyId
            }, transaction})

        await transaction.commit();
        res.status(200).json({ message: "Sale done successfully.", data: newSale })

    }
    catch (err) {
        if (transaction){ await transaction.rollback()}

        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }

}

export async function CompleteSale(req, res, next) {
    const { saleId } = req.params
    const companyId = req.user.companyId

    try {
        const sale = await context.SalesModel.findOne({ where: { id: saleId, companyId: companyId } });

        if (!sale) {
            const error = new Error("Sale not found or is not associated with your company.");
            error.statusCode = 404;
            error.data = { saleId: saleId };
            throw error;
        }

        if (sale.isCompleted === true) {
            const error = new Error("Sale is already completed.");
            error.statusCode = 400;
            error.data = { saleId: saleId };
            throw error;
        }

        await context.SalesModel.update({
            isCompleted: true,
            completedAt: Date.now()
        }, { where: { id: sale.id } })

        return res.status(200).json({ message: "Sale completed successfully." });

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}