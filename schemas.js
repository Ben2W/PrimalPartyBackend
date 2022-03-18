// these are not database models! This is nodejs validation tool. 
// idea is, if user leaves the form on the frontend, empty we can tell them to fill it up
// but what if user decides to send requests using tools like postman, i.e. without interacting with frontend?
// we have to prevent that and enforce the database rules on backend level as well. That is why this file exists



//HAVE NOT BEEN TESTED YET, WILL BE TESTED WHEN WE BUILD API ROUTES
//JUST PREPARED THE SCHEMAS FOR NOW
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

module.exports.userSchema = Joi.object({
    user: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        login: Joi.string().required(),
        password: Joi.string().required(),
        phone: Joi.string().required().min(12).max(12),
        email: Joi.string().email().required(),
        friends: Joi.array().items(Joi.objectId()),
        pendingRequests: Joi.array().items(Joi.objectId()),
        events: Joi.array().items(Joi.objectId())
    }).required()
});


module.exports.eventSchema = Joi.object({
    event: Joi.object({
        name: Joi.string().required().max(50),
        description: Joi.string().max(350),
        tags: Joi.array().items(Joi.string()),
        address: Joi.string().required(),
        date:  Joi.string().required(),
        admin: Joi.objectId().required(),
        guests: Joi.array().items(Joi.objectId()),
        tasks: Joi.array().items(Joi.objectId()),
    }).required()
})


module.exports.taskSchema = Joi.object({
    task: Joi.object({
        event: Joi.objectId().required(),
        name: Joi.string().required().max(30),
        description: Joi.string().max(100),
        assignees: Joi.array().items(Joi.objectId()),
        done: Joi.boolean().required()
    }).required()
})