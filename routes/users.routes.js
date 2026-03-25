import express from 'express'
import {
    GetAll,
    GetById,
    RegisterUser,
    EditUser,
    SwitchStatusUser
} from '../controllers/usersController.js'
import {
    validateGetByIdUser,
    validateRegisterUser,
    validateEditUser,
    validateSwitchStatusUser
} from "./validations/userValidations.js"
import { handleValidationErrors } from "../middlewares/handleValidations.js"
import isAuth from '../middlewares/isAuth.js'
import { isRoleAllowed } from '../middlewares/isRoleAllowed.js'
import { body } from "express-validator";

const router = express.Router();

//User
/**
 * 
 * @swagger
 * /api/users:
 *   get:
 *      summary: Get all users
 *      description: Get all users data
 *      tags: [Users]
 *      security:
 *        - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *      responses:
 *       200:
 *         description: Users data fetched successfully
 *       204:
 *         description: There is no users created.
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/users', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN"), GetAll);


/**
 * 
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get an user by its id
 *     description: Get an user data by its id
 *     tags: [Users]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data fetched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/users/:userId', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN"), validateGetByIdUser, handleValidationErrors(), GetById);

/**
 * 
 * @swagger
 * /api/users/register:  
 *   post:
 *     summary: User Registration
 *     description: Register a new user
 *     tags: [Users]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  userName:
 *                      type: string
 *                  userEmail:
 *                      type: string
 *                      format: email
 *                  userPassword:
 *                      type: string
 *                  userPasswordConfirm:
 *                      type: string
 *                  userRoleId:
 *                      type: string
 *              required:
 *                  - userName
 *                  - userEmail
 *                  - userPassword
 *                  - userPasswordConfirm
 *                  - userRoleId
 *     responses:
 *       201:
 *          description: User registered successfully
 *       400:
 *          description: Invalid request
 */
router.post('/users/register', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN"), validateRegisterUser, handleValidationErrors(), RegisterUser);


/**
 * 
 * @swagger
 * /api/users/{userId}:  
 *   put:
 *     summary: Edit an user by ID
 *     description: Edit the data of an user via ID
 *     tags: [Users]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to edit
 *         schema:
 *           type: string 
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  userName:
 *                      type: string
 *                  userEmail:
 *                      type: string
 *                      format: email
 *                  userRoleId:
 *                      type: string
 *              required:
 *                  - userName
 *                  - userEmail
 *                  - userRoleId
 *     responses:
 *       201:
 *          description: User updated successfully
 *       400:
 *          description: Invalid request
 */
router.put('/users/:userId', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN"), validateEditUser, handleValidationErrors(), EditUser);

/**
 * 
 * @swagger
 * /api/users/{userId}:
 *   patch:
 *     summary: Switch the status of an user by its id
 *     description: Switch the status of an user by its id
 *     tags: [Users]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to switch status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User statsus switched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.patch('/users/:userId', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN"), validateSwitchStatusUser, handleValidationErrors(), SwitchStatusUser);

export default router;