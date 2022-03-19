const Event = require('./models/event');
const AppError = require('./utils/AppError');
const {userSchema, eventSchema, taskSchema} = require('./schemas.js');

//check if there is a logged in user

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.status(403).json({error:"you have to be authenticated to do that"})
    }else{
        next();
    }
}

module.exports.isInvited = async (req, res, next) => {
    const { eventId } = req.params
    const event  = await Event.findById(eventId).populate('guests').populate('admin')
    if (event.admin._id == req.user._id){
        return next()
    }
    for (let guest of event.guests){
        if (guest._id == req.user._id){
            return next()
        }
    }
    res.status(403).json({error:"party was not found (you were not invited)"})
}

module.exports.isAdmin = async (req, res, next) => {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate('admin');
    if (!event.admin._id.equals(req.user._id)) {
        res.status(403).json({error:"you have to be admin to fulfill that task"})
    }else{
        next();
    }
}

///////////////////////////////////
//backend data entry validators
// module.exports.validateEvent = (req, res, next) => {
//     const { error } = eventSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new AppError(msg, 400)
//     } else {
//         next();
//     }
// }

// module.exports.validateUser = (req, res, next) => {
//     const { error } = userSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new AppError(msg, 400)
//     } else {
//         next();
//     }
// }

// module.exports.validateTask = (req, res, next) => {
//     const { error } = taskSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new AppError(msg, 400)
//     } else {
//         next();
//     }
// }