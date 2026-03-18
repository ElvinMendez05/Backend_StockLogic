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