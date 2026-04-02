import express from 'express'
import {
    GetAll,
    GetById,
    CreateSale,
    CompleteSale
} from '../controllers/salesController.js'
import {
    validateGetByIdSale,
    validateCreateSale,
    validateCompleteSale
} from "./validations/salesValidations.js"
import { handleValidationErrors } from "../middlewares/handleValidations.js"
import isAuth from '../middlewares/isAuth.js'
import { isRoleAllowed } from '../middlewares/isRoleAllowed.js'
import { body } from "express-validator";

const router = express.Router();

//Sales Routes
/**
 * 
 * @swagger
 * /api/sales:
 *   get:
 *      summary: Get all sales
 *      description: Get all sales data
 *      tags: [Sales]
 *      security:
 *        - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *      responses:
 *       200:
 *         description: Sales data fetched successfully
 *       204:
 *         description: There is no sales registered.
 *       400:
 *          description: Invalid request
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/sales', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN", "SELLER", "AUDITOR"), GetAll);


/**
 * 
 * @swagger
 * /api/sales/{saleId}:
 *   get:
 *     summary: Get a sale by its id
 *     description: Get a sale data by its id
 *     tags: [Sales]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         description: The ID of the sale to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale data fetched successfully
 *       400:
 *          description: Invalid request
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/sales/:saleId', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN", "SELLER", "AUDITOR"), validateGetByIdSale, handleValidationErrors(), GetById);


/**
 * 
 * @swagger
 * /api/sales:  
 *   post:
 *     summary: Register a new sale
 *     description: Register a new sale 
 *     tags: [Sales]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *              type: object
 *              properties:
 *                  productId:
 *                      type: string
 *                  clientName:
 *                      type: string
 *                  quantity:
 *                      type: integer
 *                  paymentMethod:
 *                      type: string
 *                      enum: [CASH, CREDIT_CARD, DEBIT_CARD, TRANSFER]
 *                  registerDate:
 *                      type: string
 *                      format: date
 *              required:
 *                  - productId
 *                  - clientName
 *                  - quantity
 *                  - paymentMethod
 *                  - registerDate
 *     responses:
 *       201:
 *          description: Sale registered successfully
 *       400:
 *          description: Invalid request
 *       401:
 *         description: Not authenticated or invalid token
 */
router.post('/sales', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN", "SELLER"), validateCreateSale, handleValidationErrors(), CreateSale);


/**
 * 
 * @swagger
 * /api/sales/{saleId}:
 *   patch:
 *     summary: Complete a sale by its id
 *     description: Complete a sale by its id
 *     tags: [Sales]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         description: The ID of the sale to complete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale completed successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.patch('/sales/:saleId', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN", "SELLER"), validateCompleteSale, handleValidationErrors(), CompleteSale);

export default router;