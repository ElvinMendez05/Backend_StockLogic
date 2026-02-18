import { validationResult } from "express-validator";

/** 
 * Middleware to handle validation errors
 * @param {*} redirectTo - The URL to redirect to if there are validation errors or function to determine the redirection URL
 * @returns
*/

export function handleValidationErrors(req, res, next){
    return (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error("Validation failed");
            error.statusCode = 400,
            error.data = errors.array();
            return next(error);
        }
        return next();
    }
}