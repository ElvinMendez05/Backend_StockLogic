import context from '../context/AppContext.js';
const { Sequelize } = context
import { Op } from 'sequelize';

export async function GetAll(req, res, next) {
    const companyId = req.user.companyId
    const roleCode = req.user.roleCode

    try {
        let roles 
        if(roleCode === "SUPER_ADMIN") {
            roles = await context.RolesModel.findAll({ 
                where: { 
                    code: { [Op.ne]: 'SUPER_ADMIN' } 
                } 
            });
        } else {
            roles = await context.RolesModel.findAll({ 
                where: { 
                    code: { [Op.notIn]: ['SUPER_ADMIN', 'ADMIN'] }
                } 
            }); 
        }

        if (roles.length === 0) {
            res.status(204).end();
        }

        res.status(200).json({ message: "Roles retrieved successfully.", data: roles })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}