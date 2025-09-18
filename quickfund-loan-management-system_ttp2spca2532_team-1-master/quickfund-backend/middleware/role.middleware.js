// backend/middleware/role.middleware.js

// usage: authorizeRoles('admin') or authorizeRoles('admin', 'user')
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }
      next();
    };
  };
  