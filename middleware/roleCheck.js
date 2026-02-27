const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({
                Message: "Unauthorized. Please login first."
            });
        }
        if (!allowedRoles.includes(req.users.role)){
            return res.status(403).json({
                Message: `Access denied. Tis action requires: ${allowedRoles.join("or")}role.`,
            });
        }
        next();
    };
};

module.exports = checkRole;