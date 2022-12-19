function authorize(permission, req, res, next) {
  if (req.user?.permission === permission) {
    next();
  } else {
    console.warn(`User ${req.user?.username} accessed forbidden route ${req.method} ${req.baseUrl}${req.path}`);
    res.redirect('/');
  }
}

module.exports.authorizeUser = function (req, res, next) {
  authorize('user', req, res, next);
};

module.exports.authorizeAgent = function(req, res, next) {
  authorize('agent', req, res, next);
}
