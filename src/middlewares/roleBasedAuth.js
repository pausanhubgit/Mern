const roleBasedAuth = (role) => {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(403).send("Access denied.");
    }

    const userRoles = req.user.roles.map(r => r.toLowerCase());

    if (userRoles.includes(role.toLowerCase())) {
      return next();
    }

    return res.status(403).send("Access denied.");
  };
};

export default roleBasedAuth;
