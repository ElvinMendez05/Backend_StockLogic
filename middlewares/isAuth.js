import jwt from 'jsonwebtoken'

/**
 * Middleware to check if the user is authenticated
 * If the user is authenticated, proceed to the next middleware or route handler
 *@param {*} req
 *@param {*} res
 *@param {*} next
 *@returns
 */

 export default function isAuth(req, res, next){
    try{

        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

        if(!token ) {
            const error = new error("Not authenticated.");
            error.statusCode = 401;
            throw error;
        }

        const payload = jwt.verify(token, process.env.SECRET_JWT_SEED);

        if(!payload){
            const error = new Error("Invalid token.");
            error.statusCode = 401;
            throw error;
        }

        req.user = {
            id: payload.sub,
            email: payload.email,
            usernName: payload.userName,
            companyId: payload.companyId,
            roleId: payload.roleId
        }

        next();

    }catch{
        error.statusCode = error.name == "TokenExpiredError" ? 401: (error.statusCode || 500);
        return next(error);
    }
 }