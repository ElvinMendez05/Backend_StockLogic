import express from 'express'
import {
    GetAll,
} from '../controllers/rolesController.js'
import isAuth from '../middlewares/isAuth.js'
import { isRoleAllowed } from '../middlewares/isRoleAllowed.js'
import { body } from "express-validator";

const router = express.Router();

//User
/**
 * 
 * @swagger
 * /api/roles:
 *   get:
 *      summary: Get all roles
 *      description: Get all roles data
 *      tags: [Roles]
 *      security:
 *        - BearerAuth: [] # Indica que esta ruta requiere el token en el Swagger UI
 *      responses:
 *       200:
 *         description: Roles data fetched successfully
 *       204:
 *         description: There is no roles created.
 *       401:
 *         description: Not authenticated or invalid token
 */
router.get('/roles', isAuth, isRoleAllowed("SUPER_ADMIN", "ADMIN"), GetAll);


export default router;