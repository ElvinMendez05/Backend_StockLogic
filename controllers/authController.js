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
            if (user.activateTokenExpiration <= Date.now()) {

                transaction = await Sequelize.transaction();
                masterRoleResult = await context.RolesModel.findOne({ where: { name: "SUPER_ADMIN" } }, transaction)
    
                userResult = await context.UsersModel.destroy({ where: { email: user.email } }, transaction);
    
                if (user.roleId == masterRoleResult.id) {
                    await context.CompaniesModel.destroy({ where: { id: user.companyId } }, transaction);
                }
    
                await transaction.commit();
                res.status(201).json({ message: "Activation token exipired, please register again."});

            } else {
                const error = new Error("User account is not active.");
                error.statusCode = 403;
                error.data = { email: userEmail };
                throw error;
            }
        }


        const isPasswordValid = await bcrypt.compare(userPassword, user.password)
        if (!isPasswordValid) {
            const error = new Error("Invalid password.");
            error.statusCode = 401;
            error.data = { email: userEmail };
            throw error;
        }

        const token = signJwt({ sub: user.id, email: user.email, userName: user.name, companyId: user.companyId, roleId: user.roleId });
        res.status(200).json({ message: "Login successful", data: token })

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



        await sendEmail({
            to: companyEmail,
            subject: "Bienvenido a StockLogic.",
            html: `<h2>Querido ${userName}</h2>
                <p>Gracias por registrarse. Porfavor, use el siguiente token para activar su cuenta:</p>
                <p>${token}</p>
                <p>Si usted no se ha registrado, porfavor ignore este correo.</p>`
        });



        res.status(201).json({ message: "User registered successfully. Please check your email to activate your account.", data: { email: companyEmail } })
        await transaction.commit();

    } catch (err) {
        if (transaction) await transaction.rollback();

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

export async function ActivateUser(req, res, next) {
    const { token } = req.body;

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
            res.status(201).json({ message: "Activation token exipired, please register again."})
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

        await sendEmail({
            to: userEmail,
            subject: "Stock Logic - Solicitud de Reinicio de Contraseña.",
            html: `<h2>Querido ${user.name}</h2>
                <p>Has solicitado un reinicio de contraseña. Porfavor usa este token para resetear tu contraseña:</p>
                <p>${token}</p>
                <p>Si usted no ha hecho ninguna solicitud, porfavor ignore este mensaje.</p>`
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
    const { userPasswordToken, userPassword, userPasswordConfirm } = req.body;

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

        res.status(200).json({ message: "Password reset successfully. You can now log in." })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function CheckStatus(req, res, next){
    try{
        res.status(200).json({ message: "Current logged user data sent.",
            user: req.user
        })
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

