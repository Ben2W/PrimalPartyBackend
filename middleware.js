const Event = require('./models/event');
const AppError = require('./utils/AppError');
const catchAsync = require('./utils/catchAsync');

//check if there is a logged in user

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({error:"you are not authenticated"})
    }else{
        next();
    }
}

module.exports.isInvited = catchAsync(async (req, res, next) => {
    const { eventId } = req.params
    const {_id:userId} = req.user
    const event  = await Event.findById(eventId).populate('admin').populate('guests')

    if (event.admin._id.toString() == userId){
        return next()
    }

    for (let guest of event.guests){
        if (guest._id.toString() == userId){
           return next()
        }
    }

    return res.status(404).json({error:"event was not found (you were not invited)"})
})

module.exports.isAdmin = catchAsync(async (req, res, next) => {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
    if(!event) return res.status(404).json({error:"event not found"})
    
    if (event.admin._id.toString() != req.user._id){
        return res.status(403).json({error:"you have to be admin to fulfill that task"})
    }else{
        next();
    }
})