import context from '../context/AppContext.js';
const { Sequelize } = context
import { sendEmail } from '../services/EmailService.js';
import bcrypt from 'bcrypt';
import { promisify } from 'util';
import { randomBytes } from 'crypto';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

const signJwt = (payload, opts = {}) => {

    const token = jwt.sign(payload, process.env.SECRET_JWT_SEED, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        ...opts //
    });

    return token
}

export async function Login(req, res, next) {
    const { userPassword } = req.body;

    const userEmail = req.body.userEmail.toLowerCase();

    let transaction

    try {
        const user = await context.UsersModel.findOne({ where: { email: userEmail } });
        if (!user) {
            const error = new Error("No user found with this email.");
            error.statusCode = 401;
            error.data = { email: userEmail };
            throw error;
        }



        if (!user.isActive) {
            if (user.activateTokenExpiration && user.activateTokenExpiration <= Date.now()) {

                const transaction = await Sequelize.transaction();
                const masterRoleResult = await context.RolesModel.findOne({ where: { code: "SUPER_ADMIN" } }, transaction);

                if (!masterRoleResult) {
                    const error = new Error("No main admin role found to proceed.");
                    error.statusCode = 401;
                    error.data = { email: userEmail };
                }

                await context.UsersModel.destroy({ where: { email: user.email } }, transaction);

                if (user.roleId == masterRoleResult.id) {
                    await context.CompaniesModel.destroy({ where: { id: user.companyId } }, transaction);
                }

                await transaction.commit();
                res.status(201).json({ message: "Activation token exipired, please register again." });

            } else {
                const error = new Error("User account is not active.");
                error.statusCode = 403;
                error.data = { email: userEmail };
                throw error;
            }
        }


        const isPasswordValid = await bcrypt.compare(userPassword, user.password);
        if (!isPasswordValid) {
            const error = new Error("Invalid password.");
            error.statusCode = 401;
            error.data = { email: userEmail };
            throw error;
        }

        const roleResult = await context.RolesModel.findOne({ where: { id: user.roleId } });
        if (!roleResult) {
            const error = new Error("No role found to proceed.");
            error.statusCode = 401;
            error.data = { email: userEmail };
        }

        const token = signJwt({
            sub: user.id,
            email: user.email,
            userName: user.name,
            companyId: user.companyId,
            roleCode: roleResult.code
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                userName: user.name,
                companyId: user.companyId,
                roleCode: roleResult.code
            }
        })

    } catch (err) {
        if (transaction) await transaction.rollback();

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function RegisterCompany(req, res, next) {
    const { companyName, userName, userPassword, userPasswordConfirm } = req.body;

    const companyEmail = req.body.companyEmail.toLowerCase();

    let transaction

    try {
        if (userPassword !== userPasswordConfirm) {
            const error = new Error("Password do not match.");
            error.statusCode = 400;
            error.data = { email: companyEmail };
            throw error;
        }

        const user = await context.UsersModel.findOne({ where: { email: companyEmail } });
        if (user) {
            const error = new Error("Email already registered.");
            error.statusCode = 400;
            error.data = { email: companyEmail };
            throw error;
        }

        const userHashedPassword = await bcrypt.hash(userPassword, 10);

        const randomBytesAsync = promisify(randomBytes);
        const buffer = await randomBytesAsync(32);
        const token = buffer.toString("hex");

        const expiration = Date.now() + 3600000


        transaction = await Sequelize.transaction();

        const role = await context.RolesModel.findOne({ where: { name: "SUPER_ADMIN" }, transaction });

        if (!role) {
            const error = new Error("No main admin role found to assign.");
            error.statusCode = 401;
            error.data = { email: companyEmail };
            throw error;
        }

        const newCompany = await context.CompaniesModel.create({
            name: companyName,
            email: companyEmail,
        }, { transaction: transaction });

        const newUser = await context.UsersModel.create({
            name: userName,
            email: companyEmail,
            password: userHashedPassword,
            isActive: false,
            activateToken: token,
            activateTokenExpiration: expiration,
            companyId: newCompany.id,
            roleId: role.id,
        }, { transaction: transaction });

        await transaction.commit();

        const activationUrl = `${process.env.UI_ACTIVATE_USER_URL}${token}`;

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
                        Gracias por registrarse en nuestra plataforma. Para completar el proceso y comenzar a gestionar el inventario, por favor active su cuenta haciendo clic en el siguiente botón:
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${activationUrl}" 
                           style="background-color: #5D5FEF; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(93, 95, 239, 0.2);">
                            Activar mi cuenta ahora
                        </a>
                    </div>
        
                    <div style="border-left: 4px solid #5D5FEF; padding-left: 15px; margin-bottom: 30px;">
                        <p style="color: #333; font-weight: 600; margin: 0;">Información importante:</p>
                        <p style="color: #777; margin: 5px 0 0 0; font-size: 14px;">Este enlace de activación es válido únicamente por <strong>1 hora</strong>.</p>
                    </div>
        
                    <p style="color: #999; font-size: 13px; font-style: italic;">
                        Si el botón no funciona, puede copiar y pegar el siguiente enlace en su navegador: <br>
                        <span style="word-break: break-all; color: #5D5FEF;">${activationUrl}</span>
                    </p>
                </div>
        
                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <div style="display: inline-block; padding: 10px 25px; background-color: #27AE60; color: white; border-radius: 5px; font-weight: bold; font-size: 12px; text-transform: uppercase;">
                        Estado: Registro en proceso
                    </div>
                    <p style="color: #bbb; font-size: 12px; margin-top: 15px;">&copy; 2026 StockLogic System</p>
                </div>
            </div>
            `
        });

        res.status(201).json({ message: "User registered successfully. Please check your email to activate your account.", data: { newUser: newUser, newCompany: newCompany } })


    } catch (err) {
        if (transaction) await transaction.rollback();

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

export async function ActivateUser(req, res, next) {
    const { token } = req.params;

    if (!token) {
        const error = new Error("Invalid activation token.");
        error.statusCode = 400;
        throw error;
    }

    let transaction

    try {
        const user = await context.UsersModel.findOne({
            where: {
                activateToken: token
            }
        });

        if (!user) {
            const error = new Error("User not found.");
            error.statusCode = 404;
            throw error;
        }



        if (user.activateTokenExpiration <= Date.now()) {

            transaction = await Sequelize.transaction();
            masterRoleResult = await context.RolesModel.findOne({ where: { name: "SUPER_ADMIN" } }, transaction)

            userResult = await context.UsersModel.destroy({ where: { email: user.email } }, transaction);

            if (user.roleId == masterRoleResult.id) {
                await context.CompaniesModel.destroy({ where: { id: user.companyId } }, transaction);
            }

            await transaction.commit()
            res.status(201).json({ message: "Activation token exipired, please register again." })
        }

        user.isActive = true;
        user.activateToken = null;
        user.activateTokenExpiration = null;
        const result = await user.save();

        if (!result) {
            const error = new Error("Failed to save user activation.");
            error.statusCode = 500;
            throw error;
        }

        res.status(200).json({ message: "Account activated successfully. You can now log in." })
    } catch (err) {
        if (transaction) await transaction.rollback();

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function ForgotPassword(req, res, next) {
    const userEmail = req.body.userEmail.toLowerCase();

    try {
        const user = await context.UsersModel.findOne({
            where: { email: userEmail },
        });


        if (!user) {
            const error = new Error("User not found.");
            error.statusCode = 404;
            throw error;
        }

        const randomBytesAsync = promisify(randomBytes);
        const buffer = await randomBytesAsync(32);
        const token = buffer.toString("hex");

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000
        const result = await user.save()

        if (!result) {
            const error = new Error("Failed to save reset token.");
            error.statusCode = 500;
            throw error;
        }

        const resetUrl = `${process.env.UI_RESET_PASSWORD_URL}${token}`;

        await sendEmail({
            to: userEmail,
            subject: "StockLogic - Restablecer tu contraseña",
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #5D5FEF; padding: 30px; text-align: left;">
                    <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">StockLogic</h1>
                    <p style="color: #e0e0e0; margin: 5px 0 0 0; font-size: 14px;">Seguridad de la cuenta</p>
                </div>

                <div style="padding: 40px; background-color: #ffffff;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hola, ${user.name}</h2>
                    <p style="color: #555; line-height: 1.6; font-size: 16px;">
                        Hemos recibido una solicitud para restablecer la contraseña de su cuenta. Si fuiste tú, haga clic en el siguiente botón para elegir una nueva contraseña:
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetUrl}" 
                        style="background-color: #5D5FEF; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(93, 95, 239, 0.2);">
                            Restablecer mi contraseña
                        </a>
                    </div>

                    <div style="border-left: 4px solid #E74C3C; padding-left: 15px; margin-bottom: 30px;">
                        <p style="color: #333; font-weight: 600; margin: 0;">Enlace temporal:</p>
                        <p style="color: #777; margin: 5px 0 0 0; font-size: 14px;">Por motivos de seguridad, este enlace expirará en <strong>1 hora</strong>.</p>
                    </div>

                    <p style="color: #999; font-size: 13px; font-style: italic;">
                        Si usted no ha solicitado este cambio, puede ignorar este correo. Si el botón no funciona, copie y pegue este enlace en su navegador: <br>
                        <span style="word-break: break-all; color: #5D5FEF;">${resetUrl}</span>
                    </p>
                </div>

                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <div style="display: inline-block; padding: 10px 25px; background-color: #27AE60; color: white; border-radius: 5px; font-weight: bold; font-size: 12px; text-transform: uppercase;">
                        Protección de cuenta activada
                    </div>
                    <p style="color: #bbb; font-size: 11px; margin-top: 15px;">&copy; 2026 StockLogic System</p>
                </div>
            </div>
            `
        });


        res.status(200).json({ message: "Password reset token sent to your email." })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function ResetPassword(req, res, next) {
    const { userPasswordToken } = req.params
    const { userPassword, userPasswordConfirm } = req.body;

    if (userPassword !== userPasswordConfirm) {
        const error = new Error("Password do not match.");
        error.statusCode = 400;
        throw error;
    }

    try {
        const user = await context.UsersModel.findOne({
            where: {
                resetToken: userPasswordToken,
                resetTokenExpiration: { [Op.gte]: Date.now() },
            },
        });

        if (!user) {
            const error = new Error("Invalid or expired token.");
            error.statusCode = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(userPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        const result = await user.save()

        if (!result) {
            const error = new Error("Failed to save user new password.");
            error.statusCode = 500;
            throw error;
        }

        await sendEmail({
            to: user.email,
            subject: "StockLogic - Contraseña actualizada con éxito",
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #27AE60; padding: 30px; text-align: left;">
                    <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">StockLogic</h1>
                    <p style="color: #e0f2f1; margin: 5px 0 0 0; font-size: 14px;">Actualización de seguridad</p>
                </div>
        
                <div style="padding: 40px; background-color: #ffffff;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hola, ${user.name}</h2>
        
                    <p style="color: #555; line-height: 1.6; font-size: 16px; text-align: center;">
                        Tu contraseña ha sido restablecida correctamente. Ya puedes acceder a tu panel de control con tus nuevas credenciales.
                    </p>
        
                    <div style="background-color: #f8f9fa; border-left: 4px solid #5D5FEF; padding: 15px; margin: 30px 0;">
                        <p style="color: #333; font-weight: 600; margin: 0; font-size: 14px;">¿No fuiste tú?</p>
                        <p style="color: #777; margin: 5px 0 0 0; font-size: 13px;">
                            Si no realizaste este cambio, ponte en contacto con nuestro equipo de soporte de inmediato para proteger tu cuenta.
                        </p>
                    </div>
                </div>
        
                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #bbb; font-size: 11px; margin: 0;">&copy; 2026 StockLogic System - Gestión Inteligente</p>
                </div>
            </div>
            `
        });

        res.status(200).json({ message: "Password reset successfully. You can now log in." })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function CheckStatus(req, res, next) {
    try {
        res.status(200).json({
            message: "Current logged user data sent.",
            user: req.user,
            token: req.token
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

