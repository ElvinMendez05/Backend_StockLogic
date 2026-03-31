import context from '../context/AppContext.js';
import path from 'path'
import fs from 'fs'
const { Sequelize } = context
import { Op, fn, col } from 'sequelize';

export async function GetAll(req, res, next) {
    const companyId = req.user.companyId

    try {
        const providers = await context.ProvidersModel.findAll({
            where: {
                companyId: companyId,
                isActive: true
            },
            attributes: {
                include: [
                    [fn('COUNT', col('Products.id')), 'productCount']
                ]
            },
            include: [{
                model: context.ProductsModel,
                as: 'Products',
                where: {
                    isActive: true
                },
                attributes: [],
                required: false
            }],
            group: ['Providers.id'] 
        });

        if (providers.length === 0) {
            res.status(204).end();
        }

        res.status(200).json({ message: "Providers retrieved successfully.", data: providers })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function GetById(req, res, next) {
    const { providerId } = req.params;
    const providerCompanyId = req.user.companyId

    try {
        const provider = await context.ProvidersModel.findOne({
            where: {
                id: providerId,
                companyId: providerCompanyId
            },
            include: [{
                model: context.ProductsModel,
                as: 'Products',
                where: {
                    isActive: true
                },
                required: false,
                attributes: [
                    'id',
                    'name',
                    'sku',
                    'description',
                    'imageUrl',
                    'price',
                    'costPrice',
                    'currentStock',
                    'minStock',
                    'maxStock',
                    'isActive',
                    'categoryId'
                ]
            }]
        });

        if (!provider) {
            const error = new Error("Provider not found or is not associated with your company.");
            error.statusCode = 404;
            error.data = { providerId: providerId };
            throw error;
        }

        res.status(200).json({
            message: "Provider retrieved successfully.",
            data: provider
        })

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function CreateProvider(req, res, next) {
    const {
        providerName,
        providerTaxId,
        providerContactName,
        providerEmail,
        providerPhone,
        providerAddress,
        providerWebsite,
    } = req.body

    const providerCompanyId = req.user.companyId

    try {

        const [companyExists, uniqueDataExists,] = await Promise.all([
            context.CompaniesModel.findByPk(providerCompanyId),
            context.ProvidersModel.findOne({
                where: {
                    companyId: providerCompanyId,
                    [Op.or]: [
                        { taxId: providerTaxId },
                        { email: providerEmail }
                    ]
                }
            })
        ]);

        if (!companyExists) {
            const error = new Error("The linked company is not valid.");
            error.statusCode = 404;
            throw error;
        }

        if (uniqueDataExists) {
            const error = new Error("The provider email or tax id is already registered by another provider.");
            error.statusCode = 400;
            throw error;
        }

        const newProvider = await context.ProvidersModel.create({
            name: providerName,
            taxId: providerTaxId,
            contactName: providerContactName,
            email: providerEmail,
            phone: providerPhone,
            address: providerAddress,
            website: providerWebsite,
            isActive: true,
            companyId: providerCompanyId
        });

        res.status(200).json({ message: "Provider created successfully.", data: newProvider })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
}

export async function EditProvider(req, res, next) {
    const {
        providerName,
        providerTaxId,
        providerContactName,
        providerEmail,
        providerPhone,
        providerAddress,
        providerWebsite,
    } = req.body


    const { providerId } = req.params
    const companyId = req.user.companyId


    try {
        const provider = await context.ProvidersModel.findOne({ where: { id: providerId, companyId: companyId } });

        if (!provider) {
            const error = new Error("Provider not found or is not associated with your company.");
            error.statusCode = 404;
            error.data = { providerId: providerId };
            throw error;
        }

        const providerCompanyId = provider.companyId

        const [companyExists, uniqueDataExists,] = await Promise.all([
            context.CompaniesModel.findByPk(providerCompanyId),
            context.ProvidersModel.findOne({
                where: {
                    id: { [Op.ne]: providerId },
                    companyId: providerCompanyId,
                    [Op.or]: [
                        { taxId: providerTaxId },
                        { email: providerEmail }
                    ]
                }
            })
        ]);

        if (!companyExists) {
            const error = new Error("The linked company is not valid.");
            error.statusCode = 404;
            throw error;
        }

        if (uniqueDataExists) {
            const error = new Error("The provider email or tax id is already registered by another provider.");
            error.statusCode = 400;
            throw error;
        }

        const updatedProvider = await context.ProvidersModel.update({
            name: providerName,
            taxId: providerTaxId,
            contactName: providerContactName,
            email: providerEmail,
            phone: providerPhone,
            address: providerAddress,
            website: providerWebsite,
        }, { where: { id: providerId } })

        res.status(200).json({
            message: "Provider updated successfully.",
            data: updatedProvider
        })

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
}

export async function SwitchStatusProvider(req, res, next) {
    const { providerId } = req.params
    const providerCompanyId = req.user.companyId

    try {
        const provider = await context.ProvidersModel.findOne({ where: { id: providerId, companyId: providerCompanyId } });

        if (!provider) {
            const error = new Error("Provider not found or is not associated with your company.");
            error.statusCode = 404;
            error.data = { providerId: providerId };
            throw error;
        }

        if (provider.isActive !== false) {
            await context.ProvidersModel.update({
                isActive: false
            }, { where: { id: providerId } })

            return res.status(200).json({ message: "Provider deactivated successfully." });
        }

        await context.ProvidersModel.update({
            isActive: true
        }, { where: { id: providerId } })

        return res.status(200).json({ message: "Provider activated successfully." });

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function RestockProduct(req, res, next) {
    const { productId } = req.params
    const productRestockQuantity = req.body.productRestockQuantity

    const companyId = req.user.companyId
    const requesterId = req.user.id

    let transaction = null

    try {
        transaction = await context.Sequelize.transaction();

        const product = await context.ProductsModel.findOne({ where: { id: productId, companyId: companyId, isActive: true } });

        if (!product) {
            const error = new Error("Product not found or does not belong to your company.");
            error.statusCode = 404;
            error.data = { productId: productId };
            throw error;
        }

        const productNewStockAmount = product.currentStock + productRestockQuantity

        if(productNewStockAmount > product.maxStock ){
            const error = new Error("Product new stock amount can't be greater than it's max stock.");
            error.statusCode = 400;
            error.data = { productId: productId, productCurrentStock: product.currentStock,  productNewStockAmount: productNewStockAmount, productMaxStock: product.maxStock };
            throw error;
        }
        
        const newInventoryMovement = await context.InventoryMovementsModel.create({
            productId: product.id,
            movementType: 'IN',
            quantity: productRestockQuantity,
            previousStock: product.currentStock,
            newStock: productNewStockAmount,
            userId: requesterId,
            reference: 'Product Restock',
            providerId: product.providerId, 
            companyId: companyId
        }, { transaction });
        
        await context.ProductsModel.update({
            currentStock: productNewStockAmount,         
        }, { where: { id: product.id }, transaction })


        await transaction.commit();
        res.status(200).json({ message: "Product restock done successfully.", data: newInventoryMovement })

    }
    catch (err) {
        if (transaction){ await transaction.rollback()}

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}