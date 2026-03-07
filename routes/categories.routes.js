import express from 'express'
import {
    GetAll,
    GetById,
    CreateCategory,
    EditCategory,
    DeleteCategory
} from '../controllers/categoriesController.js'
import {
    validateGetByIdCategory,
    validateCreateCategory,
    validateEditCategory,
    validateDeleteCategory,
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
 *   post:
 *     summary: Get all categories
 *     description: Get all categories data
 *     tags: [Categories]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *      responses:
 *       200:
 *         description: Categories data fetched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/categories', isAuth, isRoleAllowed("ALL_ROLES"), GetAll);


/**
 * 
 * @swagger
 * /api/categories/{id}:
 *   post:
 *     summary: Get a category by its id
 *     description: Get a category data by its id
 *     tags: [Categories]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category to retrieve
 *         schema:
 *           type: uuid
 *     responses:
 *       200:
 *         description: Category data fetched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/categories/:id', isAuth, isRoleAllowed("ALL_ROLES"), validateGetByIdCategory, handleValidationErrors(), GetById);

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
 *        multipart/from-data:
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
router.post('/categories', isAuth, isRoleAllowed("ALL_ROLES"), validateCreateCategory, handleValidationErrors(), CreateCategory);


/**
 * 
 * @swagger
 * /api/categories/{id}:  
 *   post:
 *     summary: Edit a category by ID
 *     description: Edit the data of a category via ID
 *     tags: [Categories]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the categorie to edit
 *         schema:
 *           type: uuid 
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/from-data:
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
router.put('/categories/:id', isAuth, isRoleAllowed("ALL_ROLES"), validateEditCategory, handleValidationErrors(), EditCategory);

/**
 * 
 * @swagger
 * /api/categories/{id}:
 *   post:
 *     summary: Delete a category by its id
 *     description: Delete a category data by its id
 *     tags: [Categories]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the category to delete
 *         schema:
 *           type: uuid
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.delete('/categories/:id', isAuth, isRoleAllowed("ALL_ROLES"), validateDeleteCategory, handleValidationErrors(), DeleteCategory);

export default router;