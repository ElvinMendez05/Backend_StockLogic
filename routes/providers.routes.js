import express from 'express'
import {
    GetAll,
    GetById,
    CreateProvider,
    EditProvider,
    SwitchStatusProvider
} from '../controllers/providersController.js'
import {
    validateGetByIdProvider,
    validateCreateProvider,
    validateEditProvider,
    validateSwitchStatusProvider,
} from "./validations/providerValidations.js"
import { handleValidationErrors } from "../middlewares/handleValidations.js"
import isAuth from '../middlewares/isAuth.js'
import { isRoleAllowed } from '../middlewares/isRoleAllowed.js'
import { body } from "express-validator";

const router = express.Router();

//Provider Routes
/**
 * 
 * @swagger
 * /api/providers:
 *   get:
 *      summary: Get all providers
 *      description: Get all providers data
 *      tags: [Providers]
 *      security:
 *        - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *      responses:
 *       200:
 *         description: Providers data fetched successfully
 *       204:
 *         description: There is no providers created.
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/providers', isAuth, isRoleAllowed("ALL_ROLES"), GetAll);


/**
 * 
 * @swagger
 * /api/providers/{providerId}:
 *   get:
 *     summary: Get a provider by its id and all associated products
 *     description: Get a provider data by its id and all associated products
 *     tags: [Providers]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The ID of the provider to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provider data fetched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/providers/:providerId', isAuth, isRoleAllowed("ALL_ROLES"), validateGetByIdProvider, handleValidationErrors(), GetById);

/**
 * 
 * @swagger
 * /api/providers:  
 *   post:
 *     summary: Create a new provider
 *     description: Create a new provider 
 *     tags: [Providers]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *              type: object
 *              properties:
 *                  providerName:
 *                      type: string
 *                  providerTaxId:
 *                      type: string
 *                  providerContactName:
 *                      type: string
 *                  providerEmail:
 *                      type: string
 *                      format: email
 *                  providerPhone:
 *                      type: string
 *                  providerAddress:
 *                      type: string
 *                  providerWebsite:
 *                      type: string
 *                      format: url
 *              required:
 *                  - providerName
 *                  - providerTaxId
 *                  - providerContactName
 *                  - providerEmail
 *                  - providerPhone
 *                  - providerAddress
 *     responses:
 *       201:
 *          description: Provider created successfully
 *       400:
 *          description: Invalid request
 */
router.post('/Providers', isAuth, isRoleAllowed("ALL_ROLES"), validateCreateProvider, handleValidationErrors(), CreateProvider);


/**
 * 
 * @swagger
 * /api/providers/{providerId}:  
 *   put:
 *     summary: Edit a provider by ID
 *     description: Edit the data of a provider via ID
 *     tags: [Providers]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The ID of the provider to edit
 *         schema:
 *           type: string 
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data :
 *           schema:
 *              type: object
 *              properties:
 *                  providerName:
 *                      type: string
 *                  providerTaxId:
 *                      type: string
 *                  providerContactName:
 *                      type: string
 *                  providerEmail:
 *                      type: string
 *                      format: email
 *                  providerPhone:
 *                      type: string
 *                  providerAddress:
 *                      type: string
 *                  providerWebsite:
 *                      type: string
 *                      format: url
 *              required:
 *                  - providerName
 *                  - providerTaxId
 *                  - providerContactName
 *                  - providerEmail
 *                  - providerPhone
 *                  - providerAddress
 *     responses:
 *       201:
 *          description: Providers updated successfully
 *       400:
 *          description: Invalid request
 */
router.put('/providers/:providerId', isAuth, isRoleAllowed("ALL_ROLES"), validateEditProvider, handleValidationErrors(), EditProvider);

/**
 * 
 * @swagger
 * /api/providers/{providerId}:
 *   patch:
 *     summary: Switch the status of a provider by its id
 *     description: Switch the status of a provider by its id
 *     tags: [Providers]
 *     security:
 *      - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         description: The ID of the provider to switch status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provider status switched successfully
 *       401:
 *         description: Not authenticated or invalid token
 */
router.patch('/providers/:providerId', isAuth, isRoleAllowed("ALL_ROLES"), validateSwitchStatusProvider, handleValidationErrors(), SwitchStatusProvider);

export default router;