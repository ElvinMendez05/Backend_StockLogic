import context from '../context/AppContext.js';
import path from 'path'
import fs from 'fs'
const { Sequelize } = context
import { Op } from 'sequelize';

export async function GetAll(req, res, next) {
    const companyId = req.user.companyId

    try {
        const products = await context.ProductsModel.findAll({ where: { companyId: companyId } });

        if (products.length === 0) {
            res.status(204).end();
        }

        res.status(200).json({ message: "Products retrieved successfully.", data: products })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function GetById(req, res, next) {
    const { productId } = req.params;
    const productCompanyId = req.user.companyId

    try {
        const product = await context.ProductsModel.findOne({ where: { id: productId, companyId: productCompanyId } });

        if (!product) {
            const error = new Error("Product not found or does not belong to your company.");
            error.statusCode = 404;
            error.data = { productId: productId };
            throw error;
        }

        res.status(200).json({
            message: "Product retrieved successfully.",
            data: product
        })

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function CreateProduct(req, res, next) {
    const transaction = await context.Sequelize.transaction();

    const {
        productName,
        productDescription,
        productPrice,
        productCostPrice,
        productCurrentStock,
        productMinStock,
        productMaxStock,
        productCategoryId,
        productProviderId 
    } = req.body

    const productCompanyId = req.user.companyId
    const productImage = req.file;

    let productImageUrl

    try {

        if (parseInt(productCurrentStock) > parseInt(productMaxStock) ) {
            const error = new Error("Product max stock cant be less than the current stock.");
            error.statusCode = 401;
            error.data = { productMaxStock: productMaxStock, productCurrentStock: productCurrentStock };
            throw error;
        }

        const [companyExists, categoryExists, providerExists, ] = await Promise.all([
            context.CompaniesModel.findByPk(productCompanyId),
            context.CategoriesModel.findByPk(productCategoryId),
            context.ProvidersModel.findOne({ where: { id: providerId, companyId: productCompanyId } })
        ]);

        if (!companyExists) {
            const error = new Error("The linked company is not valid.");
            error.statusCode = 404;
            throw error;
        }

        if (!categoryExists) {
            const error = new Error("The selected category does not exist.");
            error.statusCode = 400;
            throw error;
        }

        if (categoryExists.isActive === false) {
            const error = new Error("The category is not active.");
            error.statusCode = 400;
            throw error;
        } 

        if (!providerExists) {
                    const error = new Error("The provider does not exist or is not associated with your company.");
                    error.statusCode = 400;
                    throw error;
        }
        
        if (providerExists.isActive === false) {
            const error = new Error("The provider is not active.");
            error.statusCode = 400;
            throw error;
        } 

        productImageUrl = "\\" + path.relative("public", productImage.path)

        //Product SKU code creation
        const productSKUPrefix = productName.replace(/\s+/g, '').substring(0, 3).toUpperCase();

        const lastProduct = await context.ProductsModel.findOne({
            where: {
                companyId: productCompanyId,
                sku: { [Op.like]: `${productSKUPrefix}-%` }
            },
            order: [['createdAt', 'DESC']],
            transaction
        });

        let nextNumber = 1;
        if (lastProduct) {
            const lastNumber = parseInt(lastProduct.sku.split('-')[1]);
            nextNumber = lastNumber + 1
        }

        const productSKU = `${productSKUPrefix}-${nextNumber.toString().padStart(3, '0')}`;
        //

        const newProduct = await context.ProductsModel.create({
            name: productName,
            sku: productSKU,
            description: productDescription,
            imageURL: productImageUrl,
            price: productPrice,
            costPrice: productCostPrice,
            currentStock: productCurrentStock,
            minStock: productMinStock,
            maxStock: productMaxStock,
            categoryId: productCategoryId,
            companyId: productCompanyId,
            providerId: productProviderId,
        }, { transaction })

        /*         await context.InventoryMovementsModel.create({
                    productId: newProduct.id,
                    type: 'IN',
                    quantity: productCurrentStock,
                    previousStock: 0,
                    newStock: productCurrentStock,
                    userId: req.user.id,
                    reference: 'Initial Stock Upload',
                    companyId: productCompanyId
                }, { transaction }); */


        await transaction.commit();
        res.status(200).json({ message: "Product created successfully.", data: newProduct })
    }
    catch (err) {
        await transaction.rollback();

        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
}

export async function EditProduct(req, res, next) {
    const {
        productName,
        productDescription,
        productPrice,
        productCostPrice,
        productMinStock,
        productMaxStock,
        productCategoryId,
        productProviderId 
    } = req.body


    const { productId } = req.params
    const productImage = req.file
    const companyId = req.user.companyId

    let productImageUrl

    try {
        const product = await context.ProductsModel.findOne({ where: { id: productId, companyId: companyId } });

        if (!product) {
            const error = new Error("Product not found or does not belong to your company.");
            error.statusCode = 404;
            error.data = { productId: productId };
            throw error;
        }

        const productCompanyId = product.companyId

        if (parseInt(product.currentStock) > parseInt(productMaxStock)) {
            const error = new Error("Product max stock cant be less than the current stock.");
            error.statusCode = 401;
            error.data = { productMaxStock: productMaxStock, productCurrentStock: product.currentStock };
            throw error;
        }

        const [categoryExists, providerExists] = await Promise.all([
            context.CategoriesModel.findByPk(productCategoryId),
            context.ProvidersModel.findOne({ where: { id: providerId, companyId: product.companyId } }),
        ]);

        if (!categoryExists) {
            const error = new Error("The selected category does not exist.");
            error.statusCode = 400;
            throw error;
        }

        if (categoryExists.isActive === false) {
            const error = new Error("The category is not active.");
            error.statusCode = 400;
            throw error;
        } 

        if (!providerExists) {
                    const error = new Error("The supplier does not exist or does not belong to your company.");
                    error.statusCode = 400;
                    throw error;
        }

        if (providerExists.isActive === false) {
            const error = new Error("The provider is not active.");
            error.statusCode = 400;
            throw error;
        } 

        productImageUrl = product.imageUrl;
        if (productImage) {
            productImageUrl = "\\" + path.relative("public", productImage.path)
        }

        //Product SKU code update
        const productSKUPrefix = productName.substring(0, 3).toUpperCase();
        const productSKU = `${productSKUPrefix}-${product.sku.split('-')[1]}`;
        //

        const updatedProduct = await context.ProductsModel.update({
            name: productName,
            sku: productSKU,
            description: productDescription,
            imageURL: productImageUrl,
            price: productPrice,
            costPrice: productCostPrice,
            minStock: productMinStock,
            maxStock: productMaxStock,
            categoryId: productCategoryId,
            providerId: productProviderId,           
        }, { where: { id: productId } })

        res.status(200).json({
            message: "Product updated successfully.",
            data: updatedProduct
        })

    }
    catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    }
}

export async function DeleteProduct(req, res, next) {
    const { productId } = req.params
    const productCompanyId = req.user.companyId

    try {
        const product = await context.ProductsModel.findOne({ where: { id: productId, companyId: productCompanyId } });

        if (!product) {
            const error = new Error("Product not found or does not belong to your company.");
            error.statusCode = 404;
            error.data = { productId: productId };
            throw error;
        }

        await context.ProductsModel.destroy({ where: { id: productId, companyId: productCompanyId } });

        if (product.imageUrl) {
            const productImageUrl = path.join(projectRoot, "public", product.imageUrl);
            if (fs.existsSync(productImageUrl)) {
                fs.unlinkSync(productImageUrl);
            }
        }

        res.status(204).json({ message: "Product deleted successfully." })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}