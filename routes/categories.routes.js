import express from 'express'
import {
    GetAll,
    GetById,
    CreateCategory,
    EditCategory,
    SwitchStatusCategory
} from '../controllers/categoriesController.js'
import {
    validateGetByIdCategory,
    validateCreateCategory,
    validateEditCategory,
    validateSwitchStatusCategory,
} from "./validations/categoryValidations.js"
import { handleValidationErrors } from "../middlewares/handleValidations.js"
import isAuth from '../middlewares/isAuth.js'
import { isRoleAllowed } from '../middlewares/isRoleAllowed.js'
import { body } from "express-validator";

const router = express.Router();

//Category Routes
/**
 * 
 * @swagger
 * /api/categories:
 *   get:
 *      summary: Get all categories
 *      description: Get all categories data
 *      tags: [Categories]
 *      security:
 *        - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *      responses:
 *       200:
 *         description: Categories data fetched successfully
 *       204:
 *         description: There is no categories created.
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/categories', isAuth, isRoleAllowed("ALL_ROLES"), GetAll);


/**
 * 
 * @swagger
 * /api/categories/{categoryId}:
 *   get:
 *     summary: Get a category by its id
 *     description: Get a category data by its id
 *     tags: [Categories]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: The ID of the category to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category data fetched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/categories/:categoryId', isAuth, isRoleAllowed("ALL_ROLES"), validateGetByIdCategory, handleValidationErrors(), GetById);

/**
 * 
 * @swagger
 * /api/categories:  
 *   post:
 *     summary: Create a new category
 *     description: Create a new category 
 *     tags: [Categories]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  categoryName:
 *                      type: string
 *                  categoryDescription:
 *                      type: string         
 *              required:
 *                  - categoryName
 *                  - categoryDescription
 *     responses:
 *       201:
 *          description: Category created successfully
 *       400:
 *          description: Invalid request
 */
router.post('/categories', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN"), validateCreateCategory, handleValidationErrors(), CreateCategory);


/**
 * 
 * @swagger
 * /api/categories/{categoryId}:  
 *   put:
 *     summary: Edit a category by ID
 *     description: Edit the data of a category via ID
 *     tags: [Categories]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: The ID of the category to edit
 *         schema:
 *           type: string 
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              properties:
 *                  categoryName:
 *                      type: string
 *                  categoryDescription:
 *                      type: string         
 *              required:
 *                  - categoryName
 *                  - categoryDescription
 *     responses:
 *       201:
 *          description: Category updated successfully
 *       400:
 *          description: Invalid request
 */
router.put('/categories/:categoryId', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN"), validateEditCategory, handleValidationErrors(), EditCategory);

/**
 * 
 * @swagger
 * /api/categories/{categoryId}:
 *   patch:
 *     summary: Switch the status of a category by its id
 *     description: Switch the status of a category by its id
 *     tags: [Categories]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: The ID of the category to switch status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category statsus switched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.patch('/categories/:categoryId', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN"), validateSwitchStatusCategory, handleValidationErrors(), SwitchStatusCategory);

export default router;