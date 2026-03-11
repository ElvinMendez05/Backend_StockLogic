import { body, param } from 'express-validator';

export const validateGetByIdCategory = [
    param("categoryId").trim().notEmpty().withMessage("Category ID is required").escape(),
];

export const validateCreateCategory = [
    body("categoryName").trim().notEmpty().withMessage("Category name is required").escape(),
    body("categoryDescription")
        .trim()
        .notEmpty()
        .withMessage("Category description is required")
        .isLength({ max: 255 })
        .withMessage("Category description cannot exceed 255 characters")
        .escape(),
];

export const validateEditCategory = [
    param("categoryId").trim().notEmpty().withMessage("Category ID is required").escape(),
    body("categoryName").trim().notEmpty().withMessage("Category name is required").escape(),
    body("categoryDescription")
        .trim()
        .notEmpty()
        .withMessage("Category description is required")
        .isLength({ max: 255 })
        .withMessage("Category description cannot exceed 255 characters")
        .escape(),
];

export const validateDeleteCategory = [
    param("categoryId").trim().notEmpty().withMessage("Category ID is required").escape(),
];