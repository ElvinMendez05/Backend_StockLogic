import express from 'express'
import {
    Login,
    RegisterCompany,
    ForgotPassword,
    ResetPassword,
    ActivateUser,
    CheckStatus
} from '../controllers/authController.js'
import {
    validateLogin,
    validateRegisterCompany,
    validateForgotPassword,
    validateResetPassword,
    validateActivateUser
} from "./validations/authValidations.js"
import { handleValidationErrors } from "../middlewares/handleValidations.js"
import isAuth from '../middlewares/isAuth.js'
import { isRoleAllowed } from '../middlewares/isRoleAllowed.js'
import { body } from "express-validator";

const router = express.Router();

//Auth Routes
/**
 * 
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     description: Login an existing user
 *     tags: [Login/Register]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  userEmail:
 *                      type: string
 *                      format: email
 *                  userPassword:
 *                      type: string
 *              required:
 *                  - userEmail
 *                  - userPassword
 *     responses:
 *       200:
 *          description: User logged in successfully
 *       400:
 *          description: Invalid request
 *       401:   
 *          description: Unauthorized
 */
router.post('/auth/login', validateLogin, handleValidationErrors(), Login);


/**
 * 
 * @swagger
 * /api/auth/register:  
 *   post:
 *     summary: Company Registration
 *     description: Register a new company
 *     tags: [Login/Register]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  companyName:
 *                      type: string
 *                  userName:
 *                      type: string
 *                  companyEmail:
 *                      type: string
 *                      format: email
 *                  userPassword:
 *                      type: string
 *                  userPasswordConfirm:
 *                      type: string
 *              required:
 *                  - companyName
 *                  - userName
 *                  - companyEmail
 *                  - userPassword
 *                  - userPasswordConfirm
 *     responses:
 *       201:
 *          description: Company registered successfully
 *       400:
 *          description: Invalid request
 */
router.post('/auth/register', validateRegisterCompany, handleValidationErrors(), RegisterCompany);


/**
 * 
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Initiate the password recovery process
 *     tags: [Login/Register]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  userEmail:
 *                      type: string
 *                      format: email
 *              required:
 *                  - userEmail
 *     responses:
 *       200:
 *          description: Password recovery email sent
 *       400:
 *          description: Invalid request
 */
router.post('/auth/forgot-password', validateForgotPassword, handleValidationErrors(), ForgotPassword);

/**
 * 
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     description: Reset the users password
 *     tags: [Login/Register]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  userPassword:
 *                      type: string
 *                  userPasswordConfirm:
 *                      type: string
 *                  userPasswordToken:
 *                      type: string
 *              required:
 *                  - userPassword
 *                  - userPasswordConfirm
 *                  - userPasswordToken
 *     responses:
 *       200:
 *          description: Company registered successfully
 *       400:
 *          description: Invalid request
 */
router.post('/auth/reset-password', validateResetPassword, handleValidationErrors(), ResetPassword);

/**
 * 
 * @swagger
 * /api/auth/activate-user:
 *   post:
 *     summary: Activate user
 *     description: Activate a user account
 *     tags: [Login/Register]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  token:
 *                      type: string
 *              required:
 *                  - token
 *     responses:
 *       200:
 *          description: User activated successfully
 *       400:
 *          description: Invalid request
 */
router.post("/auth/activate-user", validateActivateUser, handleValidationErrors(), ActivateUser);

/**
 * 
 * @swagger
 * /api/auth/check-status:
 *   get:
 *      summary: Recover user data from token
 *      description: Recover user  data from his token
 *      tags: [User]
 *      security:
 *       - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *      responses:
 *       200:
 *         description: User token data fetched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get("/auth/check-status", isAuth, isRoleAllowed("ALL_ROLES"), CheckStatus);

export default router;