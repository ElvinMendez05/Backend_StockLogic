import { body, param } from 'express-validator';

export const validateGetByIdSale = [
    param("saleId").trim().notEmpty().withMessage("Sale ID is required").escape(),
];

export const validateCreateSale = [
    body("productId")
        .notEmpty()
        .withMessage("Product ID is required")
        .isUUID()
        .withMessage("A valid Product ID (UUID) is required")
        .escape(),
    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be an integer greater than 0")
        .toInt(),
    body("clientName")
        .trim()
        .notEmpty()
        .withMessage("Client name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Client name must be between 2 and 100 characters")
        .escape(),
    body("paymentMethod")
        .trim()
        .notEmpty()
        .withMessage("Payment method is required")
        .isIn(['CASH', 'CREDIT CARD', 'TRANSFER', 'DEBIT CARD'])
        .withMessage("Invalid payment method. Must be: CASH, CREDIT_CARD, DEBIT_CARD or TRANSFER")
        .escape(),
    body("registerDate")
        .notEmpty()
        .withMessage("Register date is required")
        .isISO8601()
        .withMessage("Register date must be a valid ISO8601 date (YYYY-MM-DD)")
        .toDate()
]

export const validateCompleteSale = [
    param("saleId").trim().notEmpty().withMessage("Sale ID is required").escape(),
];

