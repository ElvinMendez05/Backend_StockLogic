import context from '../context/AppContext.js';
const { Sequelize } = context
import { sendEmail } from '../services/EmailService.js';
import bcrypt from 'bcrypt';
import { promisify } from 'util';
import { randomBytes } from 'crypto';
import { Op } from 'sequelize';

export async function GetAll(req, res, next) {
    const companyId = req.user.companyId
    const roleCode = req.user.roleCode
    const userId = req.user.id

    try {
        const [companyExists, roleExists] = await Promise.all([
            context.CompaniesModel.findByPk(companyId),
            context.RolesModel.findOne({
                where: {
                    code: roleCode 
                }
            })
        ]);

        if (!companyExists) {
            const error = new Error("The linked company is not valid.");
            error.statusCode = 404;
            throw error;
        }

        if (!roleExists) {
            const error = new Error("The linked role is not valid.");
            error.statusCode = 404;
            throw error;
        }

        let users

        if(roleCode === "SUPER_ADMIN"){
            users = await context.UsersModel.findAll({
                where: {
                    companyId: companyId,
                    id: { [Op.ne]: userId }
                },
                include: [{
                    model: context.RolesModel,
                    as: 'Role',
                    where: {
                        code: { [Op.ne]: 'SUPER_ADMIN' }
                    },
                    attributes: ['code', 'name']
                }]
            });

        }else{
            users = await context.UsersModel.findAll({
                where: {
                    companyId: companyId,
                    id: { [Op.ne]: userId }
                },
                include: [{
                    model: context.RolesModel,
                    as: 'Role',
                    where: {
                        code: { [Op.notIn]: ['SUPER_ADMIN', 'ADMIN'] }
                    },
                    attributes: ['code', 'name']
                }]
            });
        }

        if (users.length === 0) {
            res.status(204).end();
        }

        res.status(200).json({ message: "Users retrieved successfully.", data: users })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function GetById(req, res, next) {
    const { userId } = req.params;
    
    const companyId = req.user.companyId
    const roleCode = req.user.roleCode
    const requestUserId = req.user.id

    try {
        let user
        if(roleCode === "SUPER_ADMIN"){
            user = await context.UsersModel.findOne({
                where: {
                    companyId: companyId,
                    id: { [Op.eq]: userId, [Op.ne]: requestUserId },    
                },
                include: [{
                    model: context.RolesModel,
                    as: 'Role',
                    where: {
                        code: { [Op.ne]: 'SUPER_ADMIN' }
                    },
                    attributes: ['code', 'name']
                }]
            });

        }else{
            user = await context.UsersModel.findOne({
                where: {
                    companyId: companyId,
                    id: { [Op.eq]: userId, [Op.ne]: requestUserId },    
                },
                include: [{
                    model: context.RolesModel,
                    as: 'Role',
                    where: {
                        code: { [Op.notIn]: ['SUPER_ADMIN', 'ADMIN'] }
                    },
                    attributes: ['code', 'name']
                }]
            });
        }

        if (!user) {
            const error = new Error("User not found, or does not belong to your company, or you dont have permissions to fetch it.");
            error.statusCode = 404;
            error.data = { userId: userId };
            throw error;
        }

        res.status(200).json({
            message: "User retrieved successfully.",
            data: user
        })

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function RegisterUser(req, res, next) {
    const { userName, userPassword, userPasswordConfirm, userRoleId } = req.body;

    const userEmail = req.body.userEmail.toLowerCase();

    const companyId = req.user.companyId
    const requestRoleCode = req.user.roleCode

    let transaction

    try {
        if (userPassword !== userPasswordConfirm) {
            const error = new Error("Password do not match.");
            error.statusCode = 400;
            error.data = { email: userEmail };
            throw error;
        }

        const user = await context.UsersModel.findOne({ where: { email: userEmail } });
        if (user) {
            const error = new Error("Email already registered.");
            error.statusCode = 400;
            error.data = { email: userEmail };
            throw error;
        }

        const userHashedPassword = await bcrypt.hash(userPassword, 10);

        const randomBytesAsync = promisify(randomBytes);
        const buffer = await randomBytesAsync(32);
        const token = buffer.toString("hex");

        const expiration = Date.now() + 3600000


        transaction = await Sequelize.transaction();
        let role
        if(requestRoleCode === "SUPER_ADMIN"){
            role = await context.RolesModel.findOne({ 
                where: { 
                    id: userRoleId,  
                    code: { [Op.ne]: 'SUPER_ADMIN' }  
                }, transaction });
        }else{
            role = await context.RolesModel.findOne({ where: { 
                id: userRoleId,  
                code: { [Op.notIn]: ['SUPER_ADMIN', 'ADMIN'] }  
                }, transaction });
        }

        if (!role) {
            const error = new Error("No role found to assign, or you dont have permission to assign that role.");
            error.statusCode = 401;
            error.data = { email: userEmail };
            throw error;
        }

        const newUser = await context.UsersModel.create({
            name: userName,
            email: userEmail,
            password: userHashedPassword,
            isActive: false,
            activateToken: token,
            activateTokenExpiration: expiration,
            companyId: companyId, 
            roleId: role.id,
        }, { transaction: transaction });

        await transaction.commit();

        await sendEmail({
            to: userEmail,
            subject: "Bienvenido a StockLogic.",
            html: `<h2>Querido ${userName}</h2>
                <p>Usted ha sido registrado en StockLogic. Porfavor, use el siguiente token para activar su cuenta:</p>
                <p>${token}</p>
                <p>Si usted no ha sido notificado de esta acción, porfavor ignore este correo.</p>`
        });

        await sendEmail({
            to: companyEmail,
            subject: "Bienvenido a StockLogic - Activa tu cuenta",
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #5D5FEF; padding: 30px; text-align: left;">
                    <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">StockLogic</h1>
                    <p style="color: #e0e0e0; margin: 5px 0 0 0; font-size: 14px;">Activación de cuenta</p>
                </div>
        
                <div style="padding: 40px; background-color: #ffffff;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hola, ${userName}</h2>
                    <p style="color: #555; line-height: 1.6; font-size: 16px;">
                        Usted ha sido registrado por un administrador en nuestra plataforma. Para completar el proceso y activar su cuenta, utilice el siguiente token de seguridad:
                    </p>
                    
                <div style="background-color: #f4f4f9; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0; border: 1px dashed #5D5FEF;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: bold; color: #5D5FEF; word-break: break-all; overflow-wrap: anywhere; display: block; line-height: 1.4;">
                        ${token}
                    </span>
                </div>
        
                    <div style="border-left: 4px solid #5D5FEF; padding-left: 15px; margin-bottom: 30px;">
                        <p style="color: #333; font-weight: 600; margin: 0;">Información importante:</p>
                        <p style="color: #777; margin: 5px 0 0 0; font-size: 14px;">Este código es válido únicamente por <strong>1 hora</strong>.</p>
                    </div>
        
                    <p style="color: #999; font-size: 13px; font-style: italic;">
                        Si usted no ha sido avisado de este registro, puedes ignorar este correo de forma segura.
                    </p>
                </div>
        
                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <div style="display: inline-block; padding: 10px 25px; background-color: #27AE60; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; text-transform: uppercase;">
                        Estado: Registro en proceso
                    </div>
                    <p style="color: #bbb; font-size: 12px; margin-top: 15px;">&copy; 2026 StockLogic System</p>
                </div>
            </div>
            `
        });

        res.status(201).json({ message: "User registered successfully. Please, notify him to check his email to activate his account.", data: { newUser: newUser } })


    } catch (err) {
        if (transaction) await transaction.rollback();

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

export async function EditUser(req, res, next) {
    const { userName, userRoleId,  } = req.body

    const  userEmail = req.body.userEmail.toLowerCase();
    const { userId } = req.params
    
    const companyId = req.user.companyId
    const roleCode = req.user.roleCode
    const requestUserId = req.user.id

    try {
        let user

        if (roleCode === "SUPER_ADMIN") {
            user = await context.UsersModel.findOne({
                where: {
                    id: { [Op.eq]: userId, [Op.ne]: requestUserId },                 
                    companyId: companyId,            
                },
                include: [{
                    model: context.RolesModel,
                    as: 'Role',
                    where: {
                        code: { [Op.ne]: 'SUPER_ADMIN' }
                    },
                    attributes: ['code', 'name']
                }]
            });
        }else{
            user = await context.UsersModel.findOne({
                where: {
                    id: { [Op.eq]: userId, [Op.ne]: requestUserId },                      
                    companyId: companyId,            
                },
                include: [{
                    model: context.RolesModel,
                    as: 'Role',
                    where: {
                        code: { [Op.notIn]: ['SUPER_ADMIN', 'ADMIN'] }
                    },
                    attributes: ['code', 'name']
                }]
            });
        }

        if (!user) {
            const error = new Error("User not found, or does not belong to your company, or you dont have permissions to edit it.");
            error.statusCode = 404;
            error.data = { userId: userId };
            throw error;
        }

        let updatedUser 

        if(user.email != userEmail){

            const verifyEmail = await context.UsersModel.findOne({ where: { email: userEmail } });
            if (verifyEmail) {
                const error = new Error("Email already registered.");
                error.statusCode = 400;
                error.data = { email: userEmail };
                throw error;
            }

            const randomBytesAsync = promisify(randomBytes);
            const buffer = await randomBytesAsync(32);
            const token = buffer.toString("hex");
    
            const expiration = Date.now() + 3600000
    
            updatedUser = await context.UsersModel.update({
                name: userName,
                email: userEmail,
                isActive: false,
                activateToken: token,
                activateTokenExpiration: expiration,
                roleId: userRoleId,
            }, { where: {id: userId} });
            
            await sendEmail({
                to: userEmail,
                subject: "Bienvenido a StockLogic.",
                html: `<h2>Querido ${userName}</h2>
                    <p>Usted ha sido registrado en StockLogic. Porfavor, use el siguiente token para activar su cuenta:</p>
                    <p>${token}</p>
                    <p>Si usted no ha sido notificado de esta acción, porfavor ignore este correo.</p>`
            });

            return res.status(200).json({
                message: "User updated successfully. Please, notify him to check his email to activate his account.",
                data: updatedUser
            })
    
        } else {
            updatedUser = await context.UsersModel.update({
                name: userName,
                roleId: userRoleId,      
            }, { where: { id: userId } })

            return res.status(200).json({
                message: "User updated successfully.",
                data: updatedUser
            })

        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function SwitchStatusUser(req, res, next) {
    const { userId } = req.params
    const companyId = req.user.companyId
    const roleCode = req.user.roleCode
    const requestUserId = req.user.id

    try {
        let user
        if(roleCode === "SUPER_ADMIN"){
            user = await context.UsersModel.findOne({
                where: {
                    companyId: companyId,
                    id: { [Op.eq]: userId, [Op.ne]: requestUserId },    
                },
                include: [{
                    model: context.RolesModel,
                    as: 'Role',
                    where: {
                        code: { [Op.ne]: 'SUPER_ADMIN' }
                    },
                    attributes: ['code', 'name']
                }]
            });

        }else{
            user = await context.UsersModel.findOne({
                where: {
                    companyId: companyId,
                    id: { [Op.eq]: userId, [Op.ne]: requestUserId },    
                },
                include: [{
                    model: context.RolesModel,
                    as: 'Role',
                    where: {
                        code: { [Op.notIn]: ['SUPER_ADMIN', 'ADMIN'] }
                    },
                    attributes: ['code', 'name']
                }]
            });
        }

        if (!user) {
            const error = new Error("User not found, or does not belong to your company, or you dont have permissions to switch its stauts.");
            error.statusCode = 404;
            error.data = { userId: userId };
            throw error;
        }

        if(user.isActive !== false){
            await context.UsersModel.update({
                isActive: false  
            }, { where: { id: userId } })
    
            return res.status(200).json({ message: "User deactivated successfully." });
            }
    
        await context.UsersModel.update({
            isActive: true 
        }, { where: { id: userId } })

        return res.status(200).json({ message: "User activated successfully." });
  
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
