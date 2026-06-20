const ExpressError = require("./ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        return next(new ExpressError("Please log in", 403));
    }
    next();
}