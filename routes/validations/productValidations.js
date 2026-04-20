import { body, param } from 'express-validator';

export const validateGetByIdProduct = [
    param("productId").trim().notEmpty().withMessage("Product ID is required").escape(),
];

export const validateCreateProduct = [
    body("productName")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ min: 3 })
        .withMessage("Product name must be at least 3 characters long")
        .escape(),
    body("productDescription")
        .trim()
        .notEmpty()
        .withMessage("Product description is required.")
        .isLength({ max: 50 })
        .withMessage("Product description cannot exceed 50 characters")
        .escape(),
    body("productPrice")
        .isFloat({ min: 0.01 })
        .withMessage("Price must be a number greater than 0"),
    body("productCostPrice")
        .isFloat({ min: 0 })
        .withMessage("Cost price cannot be negative"),
    body("productMinStock")
        .isInt({ min: 0 })
        .withMessage("Minimum stock must be at least 0"),
    body("productMaxStock")
        .isInt({ min: 1 })
        .withMessage("Maximum stock must be at least 1"),
    body("productCurrentStock")
        .isInt({ min: 0 })
        .withMessage("Current stock cannot be negative")
        .custom((value, { req }) => {
            if (parseInt(value) > parseInt(req.body.productMaxStock)) {
                throw new Error("Current stock cannot exceed the maximum stock");
            }
            return true;
        }),
    body("productCategoryId")
        .notEmpty()
        .withMessage("Product category ID is required")
        .isUUID()
        .withMessage("A valid Category ID is required")
        .escape(),
    body("productProviderId")
        .notEmpty()
        .withMessage("Product provider ID is required")
        .isUUID()
        .withMessage("A valid Provider ID is required")
        .escape(),
    body("productImage")
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error("Product image file is required");
            }
            
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                throw new Error("Only .png, .jpg and .jpeg formats are allowed");
            }

            return true;
    })
];

export const validateEditProduct = [
    param("productId").trim().notEmpty().withMessage("Product ID is required").escape(),
    body("productName")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ min: 3 })
        .withMessage("Product name must be at least 3 characters long")
        .escape(),
    body("productDescription")
        .trim()
        .notEmpty()
        .withMessage("Product description is required.")
        .isLength({ max: 50 })
        .withMessage("Product description cannot exceed 50 characters")
        .escape(),
    body("productPrice")
        .isFloat({ min: 0.01 })
        .withMessage("Price must be a number greater than 0"),
    body("productCostPrice")
        .isFloat({ min: 0 })
        .withMessage("Cost price cannot be negative"),
    body("productMinStock")
        .isInt({ min: 0 })
        .withMessage("Minimum stock must be at least 0"),
    body("productMaxStock")
        .isInt({ min: 1 })
        .withMessage("Maximum stock must be at least 1"),
    body("productCategoryId")
        .notEmpty()
        .withMessage("Product category ID is required")
        .isUUID()
        .withMessage("A valid Category ID is required"),
    body("productProviderId")
        .notEmpty()
        .withMessage("Product provider ID is required")
        .isUUID()
        .withMessage("A valid Provider ID is required")
        .escape(), 
    body("productImage")
        .custom((value, { req }) => {
            if (req.file) {
                const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
                if (!allowedMimeTypes.includes(req.file.mimetype)) {
                    throw new Error("Only .png, .jpg and .jpeg formats are allowed");
                }
        
                return true;
            }
            return true;
        })
];

export const validateSwitchStatusProduct = [
    param("productId")
        .trim()
        .notEmpty().withMessage("Product ID is required")
        .escape(),
];