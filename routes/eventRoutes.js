const eventRouter = require('express').Router();
const User = require('../models/user')
const Task = require('../models/task')
const Event = require('../models/event')

const { userSchema, eventSchema, taskSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAdmin, isInvited} = require('../middleware'); 



// View the events user created/got invited to 
eventRouter.get('/events', isLoggedIn, catchAsync(async(req, res) => {
	const id = req.user._id
	const events = await Event.find({$or: [{guests:id}, {admin:id}]})
	res.json({ events })
}))

// View the guests of a specific event
eventRouter.get('/events/:eventId/guests', isLoggedIn, isInvited, catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId).populate('guests')
	res.json({guests: currEvent.guests});
}))

// View the details of a specific event
eventRouter.get('/events/:eventId', isLoggedIn, isInvited, catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId).populate('guests').populate('tasks').populate('admin')
	res.json({ currEvent });
}))

// View the tasks of a specific event
eventRouter.get('/events/:eventId/tasks', isLoggedIn, isInvited, catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId)
	.populate({ 
		path: 'tasks',
		populate: {
		  path: 'assignees',
		  model: 'User'
		} 
	 })
	res.json({tasks: currEvent.tasks});
}))

// View the details of a particular task
eventRouter.get('/events/:eventId/tasks/:taskId', isLoggedIn, catchAsync(async(req, res) => {
	const { taskId } = req.params;
	const currTask = await Task.findById(taskId).populate('assignees')
	res.json({ currTask });
}))

/*
*	Nick's Routes
*/


// Finished, take a closer look into storing dates in mongoose and sending them in js
//Create a new event
eventRouter.post('/events', isLoggedIn, catchAsync(async(req, res)=>{

    const {name, description="", tags=[], address, date} = req.body;
    const admin = await User.findById(req.user._id)
    const newEvent = new Event({name : name, description : description, tags : tags, address : address, date : date, admin : admin});
    await newEvent.save();
    
    res.status(200).json({error:''});
}))

//Update event information
//Check if the user is an admin and edit the event information if so
eventRouter.put('/events/:eventId', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId} = req.params;

    const event = await Event.findById(eventId);
    if(!event){return res.status(500).json({error:'Event does not exist'})}
    const {name=event.name, description=event.description, tags=event.tags, address=event.address, date=event.date} = req.body;

    if(name == '' || date == '' || address == ''){return res.status(500).json({error:'Fields required'})}
    await Event.findByIdAndUpdate(eventId, {$set: {name : name, description : description, tags : tags, address : address, date : date}}, {new: true, runValidators: true});
    
    res.status(200).json({'error':''});
}))


//Update the task of an event
//Check if event exists, if task exists, if task is part of event, if json has all required fields. Update task information if so.
eventRouter.put('/events/:eventId/tasks/:taskId', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId, taskId} = req.params;

    const event = await Event.findById(eventId);
    if(!event){return res.status(500).json({error:'Event does not exist'})}

    const task = await Task.findById(taskId);
    if(!task){return res.status(500).json({error:'Task does not exist'})}
    if(task.event != eventId){return res.status(500).json({error:'Task is not part of this event'})}

    const {name=task.name, description=task.description, assignees=task.assignees, done=task.done} = req.body;
    if(name == '' || done == ''){return res.status(500).json({error:'Fields required'})}

    //check the adding to assignees part
    await Task.findByIdAndUpdate(taskId, {$set: {name : name, description : description, assignees : assignees, done : done}}, {new: true, runValidators: true});
    
    res.status(200).json({'error':''});
}))


//Checks if the event exists and deletes it if so
eventRouter.delete('/events/:eventId', isLoggedIn, isInvited, catchAsync(async(req, res)=>{
    const {eventId} = req.params;
    const userId = req.user._id
    const event = await Event.findById(eventId)
    const user = await User.findById(userId)
    const admin = event.admin

    try
    {
        if(admin._id.toString() == userId){
            await Event.findByIdAndDelete(eventId);
        }

        else{
            await Event.findByIdAndUpdate(event._id, {$pull: {guests: user._id}}, {new: true, runValidators: true})
            await User.findByIdAndUpdate(user._id, {$pull: {events: event._id}}, {new: true, runValidators: true})
        }
    }
    catch(err)
    {
        return res.json({error:'Event does not exist'})
    }
    
    res.status(200).json({error:''});
}))


//Add a guest to an event
//Checks if the guest is already in the event and adds them if not
eventRouter.post('/events/:eventId/guests/:guestId', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId, guestId} = req.params;
    const event = await Event.findById(eventId);
    const guest = await User.findById(guestId)

    if(!event){return res.status(500).json({error:'Event does not exist'})}
    if(event.guests.indexOf(guestId) != -1){ return res.status(500).json({error:'Guest already found in guest list'})}

    await Event.findByIdAndUpdate(event._id, { $addToSet: { guests: guest } }, {new: true, runValidators: true})
    await User.findByIdAndUpdate(guest._id, { $addToSet: { events: event } }, {new: true, runValidators: true})

    res.status(200).json({error:''});
}))

//Delete a guest from an event
//Checks if the guest is in the list and deletes it based on index if so
eventRouter.delete('/events/:eventId/guests/:guestId', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId, guestId} = req.params;
    const event = await Event.findById(eventId);

    if(!event){return res.status(500).json({error:'Event does not exist'})}
    const guestIndex = event.guests.indexOf(guestId);
    if(guestIndex == -1){ return res.status(500).json({error:'Guest not found in guests list'})}

    if(event.admin._id.toString() == guestId){
        return res.status(500).json({error:"Cannot delete admin from the event"})
    }

    await Event.findByIdAndUpdate(event._id, {$pull: {guests: guestId}}, {new: true, runValidators: true})
    await User.findByIdAndUpdate(req.user._id, {$pull: {events: event._id}}, {new: true, runValidators: true})
    await Task.updateMany({}, {$pull: {assignees: req.user._id}}, {new: true, runValidators: true})
    res.status(200).json({error:''});
}))


//Add a task to an event
//Checks if the task is already in the event and adds it if not
eventRouter.post('/events/:eventId/tasks', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId} = req.params;
    const {name, description="", assignees = []} = req.body
    const task = new Task({name:name, description:description, assignees:assignees, done:false, event:eventId})
    
    await task.save()
    const event = await Event.findById(eventId);
    
    if(!event){return res.json({error:'Event does not exist'})}

    await Event.findByIdAndUpdate(event._id, { $addToSet: { tasks: task } }, {new: true, runValidators: true})

    res.status(200).json({error:''});
}))


//Delete a task from an event
//Checks if the task is in the list and deletes it based on index if so
eventRouter.delete('/events/:eventId/tasks/:taskId', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId, taskId} = req.params;
    const event = await Event.findById(eventId);

    if(!event){return res.status(500).json({error:'Event does not exist'})}
    const taskIndex = event.tasks.indexOf(taskId);
    if(taskIndex == -1){ return res.json({error:'task not found in task list'})}

    await Event.findByIdAndUpdate(event._id, {$pull: {tasks: taskId}}, {new: true, runValidators: true})
    await Task.findByIdAndDelete(taskId)
    res.status(200).json({'error':''});
}))

module.exports = eventRouter;