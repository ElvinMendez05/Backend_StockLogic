import context from '../context/AppContext.js';
const { Sequelize } = context
import { Op } from 'sequelize';

export async function GetAll(req, res, next) {
    const companyId = req.user.companyId

    try {
        const categories = await context.CategoriesModel.findAll({ where: { companyId: companyId } });

        if (categories.length === 0) {
            res.status(204).end();
        }

        res.status(200).json({ message: "Categories retrieved successfully.", data: categories })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


export async function GetById(req, res, next) {
    const { categoryId } = req.params;
    const categoryCompanyId = req.user.companyId

    try {
        const category = await context.CategoriesModel.findOne({ where: { id: categoryId, companyId: categoryCompanyId } });

        if (!category) {
            const error = new Error("Category not found or does not belong to your company.");
            error.statusCode = 404;
            error.data = { categoryId: categoryId };
            throw error;
        }

        res.status(200).json({
            message: "Category retrieved successfully.",
            data: category
        })

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function CreateCategory(req, res, next) {
    const {
        categoryName,
        categoryDescription,
    } = req.body

    const categoryCompanyId = req.user.companyId

    try {
        const [companyExists] = await Promise.all([
            context.CompaniesModel.findByPk(categoryCompanyId)
        ]);

        if (!companyExists) {
            const error = new Error("The linked company is not valid.");
            error.statusCode = 404;
            throw error;
        }

        const newCategory = await context.CategoriesModel.create({
            name: categoryName,
            description: categoryDescription,
            companyId: categoryCompanyId
        })
        
        res.status(200).json({ message: "Category created successfully.", data: newCategory })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function EditCategory(req, res, next) {
    const {
        categoryName,
        categoryDescription,
    } = req.body


    const { categoryId } = req.params
    const companyId = req.user.companyId

    try {
        const category = await context.CategoriesModel.findOne({ where: { id: categoryId, companyId: companyId } });

        if (!category) {
            const error = new Error("Category not found or does not belong to your company.");
            error.statusCode = 404;
            error.data = { categoryId: categoryId };
            throw error;
        }

        const updatedCategory = await context.CategoriesModel.update({
            name: categoryName,
            description: categoryDescription,      
        }, { where: { id: categoryId } })

        res.status(200).json({
            message: "Category updated successfully."
        })

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function DeleteCategory(req, res, next) {
    const { categoryId } = req.params
    const categoryCompanyId = req.user.companyId

    try {
        const category = await context.CategoriesModel.findOne({ where: { id: categoryId, companyId: categoryCompanyId } });

        if (!category) {
            const error = new Error("Category not found or does not belong to your company.");
            error.statusCode = 404;
            error.data = { categoryId: categoryId };
            throw error;
        }

        await context.CategoriesModel.destroy({ where: { id: categoryId, companyId: categoryCompanyId } });
  
        res.status(204).json({ message: "Category deleted successfully." })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}