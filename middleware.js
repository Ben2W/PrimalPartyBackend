const Event = require('./models/event');
const AppError = require('./utils/AppError');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next("you have to be authorized to do that", 403)
    }else{
        next();
    }
}


module.exports.isAdmin = async (req, res, next) => {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event.admin.equals(req.user._id)) {
        next("you have to be an admin to fulfill this request", 403)
    }else{
        next();
    }
}