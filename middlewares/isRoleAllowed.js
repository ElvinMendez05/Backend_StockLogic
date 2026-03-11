/**
 * Role middleware validation
 * @param  {...string} allowedRoles - Allowed roles list ("SUPER_ADMIN", "ADMIN"...)
 */
export const isRoleAllowed = (...allowedRoles) => {
    return (req, res, next) => {
        try {

            if (!req.user) {
                const error = new Error("User not found in request.");
                error.statusCode = 401;
                throw error;
            }

            if (allowedRoles.includes("ALL_ROLES")) {
                return next();
            }

            if (allowedRoles.includes(req.user.roleCode)) {
                return next();
            }

            const error = new Error("You do not have permission to perform this action.");
            error.statusCode = 403; 
            throw error;

        } catch (err) {
            next(err);
        }
    };
};

