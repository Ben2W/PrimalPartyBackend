const eventRouter = require('express').Router();
const User = require('../models/user')
const Task = require('../models/task')
const Event = require('../models/event')

const { userSchema, eventSchema, taskSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAdmin, isInvited} = require('../middleware') 



// View the events user created/got invited to 
eventRouter.get('/events', isLoggedIn, catchAsync(async(req, res) => {
	const id = req.user._id
	const events = await Event.find({$or: [ {admin:id}, {guests:id}]})
	res.json({ events })
}))

// View the details of a specific event
eventRouter.get('/events/:eventId', isLoggedIn, isInvited, catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId).populate('guests').populate('tasks')
	res.json({ currEvent });
}))

// View the guests of a specific event
eventRouter.get('/events/:eventId/guests', isLoggedIn, isInvited, catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId).populate('guests')
	res.json({guests: currEvent.guests});
}))


//needs repopulation
// View the tasks of a specific event
eventRouter.get('/events/:eventId/tasks', isLoggedIn, catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId).populate('tasks')

    //fill in the tasks here

	res.json({tasks: currEvent.tasks});
}))

// View the details of a particular task
eventRouter.get('/events/:eventId/tasks/:taskId', isLoggedIn, catchAsync(async(req, res) => {
	const { taskId } = req.params;
	const currTask = await Task.findById(taskId).populate('assignees')
	
	res.json({ currTask });
}))





// //Create a new event
// app.post('/events', catchAsync(async(req, res)=>{

//     const {name, description, tags, address, date, admin, guests, tasks} = req.body;
//     const newEvent = new Event({name : name, description : description, tags : tags, address : address, date : date, admin : admin, guests : guests, tasks : tasks});
//     await newEvent.save();
    
//     res.json(200);
// }))


// //Add a guest to an event
// //Checks if the guest is already in the event and adds them if not
// app.post('/events/:eventId/guests/:guestId', catchAsync(async(req, res)=>{

//     const {eventId, guestId} = req.params;
//     const event = await Event.findById(eventId);
    
//     if(event.guests.indexOf(guestId) != -1)
//     { 
//         throw new AppError ("Guest already found in guest list", 300);
//     };

//     event.guests.push(guestId);
//     event.save();
//     res.json(200);
// }))

// //Delete a guest from an event
// //Checks if the guest is in the list and deletes it based on index if so
// app.delete('/events/:eventId/guests/:guestId', catchAsync(async(req, res)=>{

//     const {eventId, guestId} = req.params;
//     const event = await Event.findById(eventId);
//     const guestIndex = event.guests.indexOf(guestId);
    
//     if(guestIndex == -1)
//     { 
//         throw new AppError ("Guest not found", 300);
//     };

//     event.guests.splice(guestIndex, 1);
//     event.save();
//     res.json(200);
// }))

// //Delete a task from an event
// //Checks if the task is in the list and deletes it based on index if so
// app.delete('/events/:eventId/tasks/:taskId', catchAsync(async(req, res)=>{

//     const {eventId, taskId} = req.params;
//     const event = await Event.findById(eventId);
//     const taskIndex = event.tasks.indexOf(taskId);
    
//     if(taskIndex == -1)
//     { 
//         throw new AppError ("task not found", 300);
//     };

//     event.tasks.splice(taskIndex, 1);
//     event.save();
//     res.json(200);
// }))

module.exports = eventRouter;