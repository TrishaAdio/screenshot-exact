const { verifyToken } = require("../config/jwt");

// Verifies JWT and ensures the token was issued for an admin (role === "admin").
// Keeps admin tokens strictly separate from regular user tokens.
module.exports = function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Admin authentication required" });
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access only" });
    }
    req.admin = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired admin token" });
  }
};
