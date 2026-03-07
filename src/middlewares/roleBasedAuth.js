const roleBasedAuth = (roles) => {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const userRoles = req.user.roles.map(r => r.toLowerCase());

    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    const hasRole = requiredRoles.some(role => userRoles.includes(role.toLowerCase()));

    if (hasRole) {
      return next();
    }

    return res.status(403).json({ message: "Access denied." });
  };
};

export default roleBasedAuth;
