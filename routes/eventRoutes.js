const eventRouter = require('express').Router();
const User = require('../models/user')
const Task = require('../models/task')
const Event = require('../models/event')

const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAdmin, isInvited} = require('../middleware'); 



// View the events user created/got invited to 
/**
 * @swagger
 * /events:
 *  get:
 *      description: View the events user created/got invited to 
 *      tags:
 *        - Events 
 *        - Get
 *      responses:
 *          '200':
 *              description: {{eventList}}
 *          '401':
 *              description: you are not authenticated
 *          '500':
 *              description: unexepected error
 */
eventRouter.get('/events', isLoggedIn, catchAsync(async(req, res) => {
	const id = req.user._id
	const events = await Event.find({$or: [{guests:id}, {admin:id}]})
    .populate({ 
		path: 'tasks',
		populate: {
		  path: 'assignees',
		  model: 'User'
		} 
	 })
     .populate({ 
		path: 'guests'
	 })
    .populate({
        path: 'admin'
    })
	res.json({ events })
}))

//View the tasks the user has assigned to them 
/**
 * @swagger
 * /tasks:
 *  get:
 *      description: View the tasks the user has assigned to them 
 *      tags:
 *        - Events 
 *        - Get
 *      responses:
 *          '200':
 *              description: {{taskList}}
 *          '401':
 *              description: you are not authenticated
 *          '500':
 *              description: unexepected error
 */
 eventRouter.get('/tasks', isLoggedIn, catchAsync(async(req, res) => {
	const id = req.user._id
	const tasks = await Task.find({assignees : id})
     .populate({ 
		path: 'assignees'
	 })
    .populate({
        path: 'event'
    })
	res.json({ tasks })
}))

// View the guests of a specific event
/**
 * @swagger
 * /events/{eventId}/guests:
 *  get:
 *      description: View the guests of a specific event
 *      tags:
 *        - Events 
 *        - Get
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 623018e31d596470d49769e0
 *              required: true
 *              description: "The ID of the event, from which we are pulling guest information from"
 *              
 *      responses:
 *          '200':
 *              description: list of guests.
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated, isLoggedIn.js
 *          '404':
 *              description: party was not found (you were not invited)
 *              
 */
eventRouter.get('/events/:eventId/guests', isLoggedIn, isInvited, catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId).populate('guests')
	res.json({guests: currEvent.guests});
}))

// View the details of a specific event
/**
 * @swagger
 * /events/{eventId}:
 *  get:
 *      description: View the details of a specific event
 *      tags:
 *        - Events 
 *        - Get
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 623018e31d596470d49769e0
 *              required: true
 *              description: "The ID of the event, from which we are the event info from"
 *              
 *      responses:
 *          '200':
 *              description: event information.
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated
 *          '404':
 *              description: party was not found (you were not invited)"
 *              
 */
eventRouter.get('/events/:eventId', isLoggedIn, isInvited, catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId)
        .populate({ 
		path: 'tasks',
		populate: {
		  path: 'assignees',
		  model: 'User'
		} 
	 })
     .populate({ 
		path: 'guests'
	 })
    .populate({
        path: 'admin'
    })
	res.json({ currEvent });
}))

// View the tasks of a specific event
/**
 * @swagger
 * /events/{eventId}/tasks:
 *  get:
 *      description: View the guests of a specific event
 *      tags:
 *        - Events 
 *        - Get
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 623018e31d596470d49769e0
 *              required: true
 *              description: "The ID of the event, from which we are pulling task information from"
 *              
 *      responses:
 *          '200':
 *              description: list of tasks.
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated
 *          '404':
 *              description: party was not found (you were not invited)"
 *              
 */
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
/**
 * @swagger
 * /events/{eventId}/tasks/{taskId}:
 *  get:
 *      description: View the details of a particular task
 *      tags:
 *        - Events 
 *        - Get
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 623018e31d596470d49769e0
 *              required: true
 *              description: "The ID of the event, from which we are the event info from"
 *          -   in: path
 *              name: taskId
 *              schema:
 *                  type: string
 *                  example: 623018e31d596470d49769e0
 *              required: true
 *              description: "The ID of the task, from which we are the task info from"
 * 
 *              
 *      responses:
 *          '200':
 *              description: task information.
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated
 *          '404':
 *              description: event not found or task does not exist"
 *              
 */
eventRouter.get('/events/:eventId/tasks/:taskId', isLoggedIn, isInvited, catchAsync(async(req, res) => {
	const { taskId,eventId } = req.params;
    const event = await Event.findById(eventId)
    for (let task of event.tasks){
        if (task == taskId){
            const currTask = await Task.findById(taskId).populate('assignees')
            if(!currTask) return res.status(404).json({error:'Task does not exist'})

	        return res.status(200).json({currTask})
        }
     }
     res.status(404).json({error:'task does not belong to this event'})
}))


/**
 * 
 * @swagger
 * /events:
 *  post:
 *      description: Create a new event.
 *      tags:
 *        - Events
 *        - Post
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: The name of the event
 *                              example: movienight
 *                          description:
 *                              type: string
 *                              description: NOT REQUIRED, the  description of the event
 *                              example: movie night with the boys
 *                          tags:
 *                              type: array
 *                              items:
 *                                  type: string
 *                                  example: movie
 *                              description: tags for the event
 *                          address:
 *                              type: string
 *                              description: the event address
 *                              example: 1333 something lane                       
 *                          date:
 *                              type: date-time
 *                              description: the date, TODO, Make this datatime instead of a string
 *                              example: 2022-04-21T17:32:28Z
 *                      required:
 *                        - name
 *                        - description
 *                        - tags
 *                        - address
 *                        - date
 *         
 *      responses:
 *          '200':
 *              description: new event
 *          '500':
 *              description: There is an unexepected issue creating this event
 *          '401':
 *              description: you are not authenticated
 *          '400':
 *              description: the "date" parameter is not a date.
 *              
 */
eventRouter.post('/events', isLoggedIn, catchAsync(async(req, res)=>{

    const {name, description="", tags=[], address, date} = req.body;
    if(!Date.parse(date)) {return res.status(400).json({error:'the date parameter is not a date.'})}
    const admin = await User.findById(req.user._id)
    const newEvent = new Event({name : name, description : description, tags : tags, address : address, date : date, admin : admin});
    const updatedAdmin = await User.findByIdAndUpdate(req.user._id, { $addToSet: { events: newEvent}}, {new: true, runValidators: true})
    await newEvent.save();
    
    res.status(200).json({newEvent});
}))

//Update event information
/**
 * @swagger
 * /events/{eventId}:
 *  put:
 *      description: Check if the user is an admin and edit the event information if so
 *      tags:
 *        - Events 
 *        - Put
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 623018e31d596470d49769e0
 *              required: true
 *              description: "The ID of the event, from which we are going to edit"
 * 
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: The name of the event
 *                              example: movienight
 *                          description:
 *                              type: string
 *                              description: the  description of the event
 *                              example: movie night with the boys
 *                          tags:
 *                              type: array
 *                              items:
 *                                  type: string
 *                                  example: movie
 *                              description: tags for the event
 *                          address:
 *                              type: string
 *                              description: the event address
 *                              example: 1333 something lane                       
 *                          date:
 *                              type: string
 *                              description: the date, TODO, Make this datatime instead of a string
 *                              example: Monday 
 *              
 *      responses:
 *          '200':
 *              description: the  updated event info.
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated
 *          '404':
 *              description: event was not found
 *          '400':
 *              description: Fields cannot be empty
 *              
 */
eventRouter.put('/events/:eventId', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId} = req.params;

    const event = await Event.findById(eventId);
    if(!event){return res.status(404).json({error:'Event does not exist'})}
    const {name=event.name, description=event.description, tags=event.tags, address=event.address, date=event.date} = req.body;

    if(name == '' || date == '' || address == ''){return res.status(500).json({error:'Fields required'})}
    const updatedEvent = await Event.findByIdAndUpdate(eventId, {$set: {name : name, description : description, tags : tags, address : address, date : date}}, {new: true, runValidators: true})    
    .populate({ 
		path: 'tasks',
		populate: {
		  path: 'assignees',
		  model: 'User'
		} 
	 })
     .populate({ 
		path: 'guests'
	 })
    .populate({
        path: 'admin'
    });
    
    res.status(200).json({updatedEvent});
}))


//Check if event exists, if task exists, if task is part of event, if json has all required fields. Update task information if so.
/**
 * @swagger
 * /events/{eventId}/tasks/{taskId}:
 *  put:
 *      description: if event exists, if task exists, if task is part of event, if json has all required fields. Update task information if so.
 *      tags:
 *        - Events
 *        - Put
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the event which you are deleting the guest from."
 *          -   in: path
 *              name: taskId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the task which you are deleting from the event."
 * 
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: name of the task
 *                              example: Bring Soda
 *                          description:
 *                              type: string
 *                              description: description of the task
 *                              example: Bring Pepsi, Coke, and Fanta
 *                          assignees:
 *                              type: array
 *                              items:
 *                                  type: string
 *                                  example: asdas7d6a879yhi
 *                              description: guests to assign 
 *                          done:
 *                              type: boolean
 *                              description: whether or not this task has been completed
 *                              example: true
 * 
 *      responses:
 *          '200':
 *              description: successfully deleted the task
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated, isLoggedIn.js
 *          '403':
 *              description: you are do not have permission to do that
 *          '404':
 *              description: event does not exist
 *          '410':
 *              description: task not in list
 *              
 */
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
/**
 * @swagger
 * /events/{eventId}:
 *  delete:
 *      description: Checks if the event exists and deletes it if so
 *      tags:
 *        - Events
 *        - Delete
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the event which you are trying to delete"
 *          
 *      responses:
 *          '200':
 *              description: successfully deleted event
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated, isLoggedIn.js
 *          '404':
 *              description: event does not exist
 * 
 *              
 */
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
            await Event.findByIdAndUpdate(event._id, {$pull: {guests: req.user._id}}, {new: true, runValidators: true})
            await User.findByIdAndUpdate(user._id, {$pull: {events: event._id}}, {new: true, runValidators: true})
            
            await Task.updateMany({event:eventId}, {$pull:{assignees:req.user._id}}, {new:true, runValidators:true})
        }
    }
    catch(err)
    {
        return res.status(500).json({status:'an unexpected error occured'});
    }
    
    res.status(200).json({status:'successfully deleted event'});
}))


//Checks if the guest is already in the event and adds them if not
/**
 * @swagger
 * /events/{eventId}/guests/{guestId}:
 *  post:
 *      description: Checks if the guest is already in the event and adds them if not
 *      tags:
 *        - Events
 *        - Post
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the event which you are adding a guest to."
 *          -   in: path
 *              name: guestId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the guest which you are adding to the event."
 *      responses:
 *          '200':
 *              description: successfully added guest
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated
 *          '403':
 *              description: you have to be an admin to do that
 *          '404':
 *              description: event not found
 *          '410':
 *              description: guest already found in list
 *          '411':
 *              description: event does not exist
 *              
 */
eventRouter.post('/events/:eventId/guests/:guestId', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId, guestId} = req.params;
    const event = await Event.findById(eventId);
    const guest = await User.findById(guestId)

    if(!event){return res.status(411).json({error:'Event does not exist'})}
    if(event.guests.indexOf(guestId) != -1){ return res.status(410).json({error:'Guest already found in guest list'})}

    await Event.findByIdAndUpdate(event._id, { $addToSet: { guests: guest } }, {new: true, runValidators: true})
    const newGuest = await User.findByIdAndUpdate(guest._id, { $addToSet: { events: event } }, {new: true, runValidators: true})

    event.save()
    res.status(200).json({newGuest});
}))

//Deletes a guest if the guest is in the event
/**
 * @swagger
 * /events/{eventId}/guests/{guestId}:
 *  delete:
 *      description: Deletes a guest if the guest is in the event
 *      tags:
 *        - Events
 *        - Delete
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the event which you are deleting the guest from."
 *          -   in: path
 *              name: guestId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the guest which you are deleting from the event."
 *      responses:
 *          '200':
 *              description: successfully deleted the guest
 *          '500':
 *              description: unexepected error
 *          '403':
 *              description: you do not have permission to do that
 *          '404':
 *              description: Event not found, isAdmin.js
 *          '410':
 *              description: Gues not found in guest list
 *          '411':
 *              description: event does not exist
 *              
 */
eventRouter.delete('/events/:eventId/guests/:guestId', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId, guestId} = req.params;
    const event = await Event.findById(eventId);

    if(!event){return res.status(410).json({error:'Event does not exist'})}
    const guestIndex = event.guests.indexOf(guestId);
    if(guestIndex == -1){ return res.status(410).json({error:'Guest not found in guests list'})}

    if(event.admin._id.toString() == guestId){
        return res.status(403).json({error:"Cannot delete admin from the event"})
    }

    const updateEvent =  await Event.findByIdAndUpdate(event._id, {$pull: {guests: guestId}}, {new: true, runValidators: true})
    await User.findByIdAndUpdate(req.user._id, {$pull: {events: event._id}}, {new: true, runValidators: true})

    await Task.updateMany({event:eventId}, {$pull:{assignees:req.user._id}}, {new:true, runValidators:true})

    const remainingGuests = updateEvent.guests
    res.status(200).json({remainingGuests});
}))

//Adds a task to the event
/**
 * @TODO Issue, if the assignee doesnt correspond with a valid user the error is not handled
 * 
 * @swagger
 * /events/{eventId}/tasks:
 *  post:
 *      description: Adds a task to the event
 *      tags:
 *        - Events
 *        - Post
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the event which you are adding a guest to."
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: name of the task
 *                              example: Bring Soda
 *                          description:
 *                              type: string
 *                              description: description of the task
 *                              example: Bring Pepsi, Coke, and Fanta
 *                          assignees:
 *                              type: array
 *                              items:
 *                                  type: string
 *                                  example: asdas7d6a879yhi
 *                              description: guests to assign 
 *                      required:
 *                        - name
 *                      
 * 
 *      responses:
 *          '200':
 *              description: successfully added guest
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated, isLoggedIn.js
 *          '403':
 *              description: you do not have permission to do that
 *          '404':
 *              description: Event not found, isAdmin.js
 *          '400':
 *              description: Bad request. Name cannot be blank
 *              
 */
eventRouter.post('/events/:eventId/tasks', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId} = req.params;
    const {name, description="", assignees = []} = req.body

    if(name == '') return res.status(400).json({error:"name cannot be blank"})

    if(assignees == []){
        task = new Task({name:name, description:description, done:false, event:eventId})
    } else {
        task = new Task({name:name, description:description, assignees:assignees, done:false, event:eventId})
    }
    
    //return res.status(400).json({error:"name cannot be blank"})
    
    await task.save()
    const event = await Event.findById(eventId);
    
    if(!event) return res.status(404).json({error:"Event does not exist"})

    const retval = await Event.findByIdAndUpdate(event._id, { $addToSet: { tasks: task } }, {new: true, runValidators: true})
	.populate({ 
		path: 'tasks',
		populate: {
		  path: 'assignees',
		  model: 'User'
		} 
	 })
    res.status(200).json({retval});
}))

//Delete a task from an event if the tesk is in the event
/**
 * @swagger
 * /events/{eventId}/tasks/{taskId}:
 *  delete:
 *      description: Deletes a task if the task is in the event
 *      tags:
 *        - Events
 *        - Delete
 *      parameters:
 *          -   in: path
 *              name: eventId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the event which you are deleting the guest from."
 *          -   in: path
 *              name: taskId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the ID of the task which you are deleting from the event."
 *      responses:
 *          '200':
 *              description: successfully deleted the task
 *          '500':
 *              description: unexepected error
 *          '401':
 *              description: you are not authenticated, isLoggedIn.js
 *          '403':
 *              description: you do not have permission to do that
 *          '404':
 *              description: event does not exist
 *          '410':
 *              description: task not in list
 *              
 */
eventRouter.delete('/events/:eventId/tasks/:taskId', isLoggedIn, isAdmin, catchAsync(async(req, res)=>{

    const {eventId, taskId} = req.params;
    const event = await Event.findById(eventId);

    if(!event){return res.status(404).json({error:'event does not exist'})}
    const taskIndex = event.tasks.indexOf(taskId);
    if(taskIndex == -1) {return res.status(410).json({error:'task does not in list'})}

    const updatedEvent = await Event.findByIdAndUpdate(event._id, {$pull: {tasks: taskId}}, {new: true, runValidators: true})
    await Task.findByIdAndDelete(taskId)

    const tasks = updatedEvent.tasks
    res.status(200).json({tasks});
}))

module.exports = eventRouter;