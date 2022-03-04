module.exports = (req, res, next) => {
  // 401: Unauthorized
  // 403: Forbidden

  if (!req.user.IsAdmin) return res.status(403).send("Access denied.");
  next();
};
