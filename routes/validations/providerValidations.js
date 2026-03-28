import { body, param } from 'express-validator';

export const validateGetByIdProvider = [
    param("providerId")
        .trim()
        .notEmpty().withMessage("Provider ID is required")
        .escape(),
];

export const validateSwitchStatusProvider = [
    param("providerId")
        .trim()
        .notEmpty().withMessage("Provider ID is required")
        .escape(),
];


export const validateCreateProvider = [
        body("providerName")
        .trim()
        .notEmpty().withMessage("Provider name is required")
        .isLength({ min: 3, max: 50 }).withMessage("Provider name must be between 3 and 50 characters")
        .escape(),

    body("providerTaxId")
        .trim()
        .notEmpty().withMessage("Provider Tax ID (RUC/RNC/RFC) is required")
        .escape(),

    body("providerContactName")
        .trim()
        .notEmpty().withMessage("Contact name is required")
        .escape(),

    body("providerEmail")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("providerPhone")
        .trim()
        .notEmpty().withMessage("Phone number is required")
        .escape(),

    body("providerAddress")
        .trim()
        .notEmpty().withMessage("Address is required")
        .isLength({ max: 250 }).withMessage("Address cannot exceed 250 characters")
        .escape(),

    body("providerWebsite")
        .trim()
        .notEmpty().withMessage("Website is required")
        .isURL().withMessage("Invalid website URL format")
        .escape(),
];

export const validateEditProvider = [
    param("providerId")
        .trim()
        .notEmpty().withMessage("Provider ID is required")
        .escape(),

    body("providerName")
        .trim()
        .notEmpty().withMessage("Provider name is required")
        .isLength({ min: 3, max: 50 }).withMessage("Provider name must be between 3 and 50 characters")
        .escape(),

    body("providerTaxId")
        .trim()
        .notEmpty().withMessage("Provider Tax ID (RUC/NIT/RFC) is required")
        .escape(),

    body("providerContactName")
        .trim()
        .notEmpty().withMessage("Contact name is required")
        .escape(),

    body("providerEmail")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("providerPhone")
        .trim()
        .notEmpty().withMessage("Phone number is required")
        .escape(),

    body("providerAddress")
        .trim()
        .notEmpty().withMessage("Address is required")
        .isLength({ max: 250 }).withMessage("Address cannot exceed 250 characters")
        .escape(),

    body("providerWebsite")
        .trim()
        .notEmpty().withMessage("Website is required")
        .isURL().withMessage("Invalid website URL format")
        .escape(),
];

export const validateRestockProduct = [
    param("productId")
        .isUUID()
        .withMessage("A valid Product ID is required")
        .escape(),
    body("productRestockQuantity")
        .notEmpty()
        .withMessage("Restock quantity is required")
        .isInt({ min: 1 })
        .withMessage("Restock quantity must be an integer greater than 0")
        .toInt(), 
    body("reference")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Reference description cannot exceed 200 characters")
        .escape()
];