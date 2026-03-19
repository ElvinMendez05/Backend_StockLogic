import express from 'express'
import {
    GetAll,
    GetById,
    CreateProduct,
    EditProduct,
    DeleteProduct
} from '../controllers/productsController.js'
import {
    validateGetByIdProduct,
    validateCreateProduct,
    validateEditProduct,
    validateDeleteProduct,
} from "./validations/productValidations.js"
import { handleValidationErrors } from "../middlewares/handleValidations.js"
import isAuth from '../middlewares/isAuth.js'
import { isRoleAllowed } from '../middlewares/isRoleAllowed.js'
import { body } from "express-validator";

const router = express.Router();

//Product Routes
/**
 * 
 * @swagger
 * /api/products:
 *   get:
 *      summary: Get all products
 *      description: Get all products data
 *      tags: [Products]
 *      security:
 *        - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *      responses:
 *       200:
 *         description: Products data fetched successfully
 *       204:
 *         description: There is no products created.
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/products', isAuth, isRoleAllowed("ALL_ROLES"), GetAll);


/**
 * 
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Get a product by its id
 *     description: Get a product data by its id
 *     tags: [Products]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product data fetched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/products/:productId', isAuth, isRoleAllowed("ALL_ROLES"), validateGetByIdProduct, handleValidationErrors(), GetById);

/**
 * 
 * @swagger
 * /api/products:  
 *   post:
 *     summary: Create a new product
 *     description: Create a new product 
 *     tags: [Products]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *              type: object
 *              properties:
 *                  productName:
 *                      type: string
 *                  productDescription:
 *                      type: string
 *                  productPrice:
 *                      type: number
 *                      format: float
 *                  productCostPrice:
 *                      type: number
 *                      format: float
 *                  productCurrentStock:
 *                      type: integer
 *                  productMinStock:
 *                      type: integer
 *                  productMaxStock:
 *                      type: integer
 *                  productCategoryId:
 *                      type: string
 *                  productProviderId:
 *                      type: string
 *                  productImage:
 *                      type: string
 *                      format: binary              
 *              required:
 *                  - productName
 *                  - productDescription
 *                  - productPrice
 *                  - productCostPrice
 *                  - productCurrentStock
 *                  - productMinStock
 *                  - productMaxStock
 *                  - productCategoryId
 *                  - productProviderId 
 *                  - productImage
 *     responses:
 *       201:
 *          description: Product created successfully
 *       400:
 *          description: Invalid request
 */
router.post('/products', isAuth, isRoleAllowed("ALL_ROLES"), validateCreateProduct, handleValidationErrors(), CreateProduct);


/**
 * 
 * @swagger
 * /api/products/{productId}:  
 *   put:
 *     summary: Edit a product by ID
 *     description: Edit the data of a product via ID
 *     tags: [Products]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product to edit
 *         schema:
 *           type: string 
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data :
 *           schema:
 *              type: object
 *              properties:
 *                  productName:
 *                      type: string
 *                  productDescription:
 *                      type: string
 *                  productPrice:
 *                      type: number
 *                      format: float
 *                  productCostPrice:
 *                      type: number
 *                      format: float
 *                  productMinStock:
 *                      type: integer
 *                  productMaxStock:
 *                      type: integer
 *                  productCategoryId:
 *                      type: string
 *                  productProviderId:
 *                      type: string
 *                  productImage:
 *                      type: string
 *                      format: binary                 
 *              required:
 *                  - productName
 *                  - productDescription
 *                  - productPrice
 *                  - productCostPrice
 *                  - productMinStock
 *                  - productMaxStock
 *                  - productCategoryId
 *                  - productProviderId 
 *                  - productImage
 *     responses:
 *       201:
 *          description: Product updated successfully
 *       400:
 *          description: Invalid request
 */
router.put('/products/:productId', isAuth, isRoleAllowed("ALL_ROLES"), validateEditProduct, handleValidationErrors(), EditProduct);

/**
 * 
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     summary: Delete a product by its id
 *     description: Delete a product data by its id
 *     tags: [Products]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.delete('/products/:productId', isAuth, isRoleAllowed("ALL_ROLES"), validateDeleteProduct, handleValidationErrors(), DeleteProduct);

export default router;