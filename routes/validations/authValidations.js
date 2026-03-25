import { body, param } from 'express-validator';

export const validateLogin = [
    body("userEmail").trim().isEmail().withMessage("Invalid email format.").escape(),
    body("userPassword")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .escape(),
];

export const validateRegisterCompany = [
    body("companyName").trim().notEmpty().withMessage("Company name is required").escape(),
    body("userName").trim().notEmpty().withMessage("User name is required").escape(),
    body("companyEmail").trim().isEmail().withMessage("Invalid email format").escape(),
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
        .notEmpty()
        .withMessage("Confirm password is required"),
];

export const validateActivateUser = [
    body("token").trim().notEmpty().withMessage("Token is required").escape(),
];

export const validateForgotPassword = [
    body("userEmail").trim().isEmail().withMessage("Invalid email format").escape(),
];


export const validateResetPassword = [
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
        .notEmpty()
        .withMessage("Confirm password is required"),

    body("userPasswordToken")
        .trim()
        .notEmpty()
        .withMessage("Password token is required")
        .escape(),
];