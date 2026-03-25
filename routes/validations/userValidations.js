import { body, param } from 'express-validator';

export const validateGetByIdUser = [
    param("userId").trim().notEmpty().withMessage("User ID is required").escape(),
];

export const validateRegisterUser = [
    body("userName").trim().notEmpty().withMessage("User name is required").escape(),
    body("userEmail").trim().isEmail().withMessage("Invalid email format").escape(),
    body("userPassword")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .custom((value, { req }) => {
            if (value !== req.body.userPasswordConfirm) {
                throw new Error("Passwords do not match");
            }
            return true;
        })
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number."),
    body("userPasswordConfirm")
        .trim()
        .notEmpty(),
    body("userRoleId")
        .notEmpty()
        .withMessage("User role ID is required")
        .isUUID()
        .withMessage("A valid user role ID is required")
        .escape()
];

export const validateEditUser = [
    param("userId").trim().notEmpty().withMessage("User ID is required").escape(),
    body("userName").trim().notEmpty().withMessage("User name is required").escape(),
    body("userEmail").trim().isEmail().withMessage("Invalid email format").escape(),
    body("userRoleId")
        .notEmpty()
        .withMessage("User role ID is required")
        .isUUID()
        .withMessage("A valid user role ID is required")
        .escape()
];

export const validateSwitchStatusUser = [
    param("userId").trim().notEmpty().withMessage("User ID is required").escape(),
];


