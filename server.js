///////////////////////////////////
// Requirements and dependencies
const express = require('express')
const path = require('path')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const AppError = require('./utils/AppError')
const catchAsync = require('./utils/catchAsync')


///////////////////////////////////
// .env connections
const url = process.env.MONGOURL


///////////////////////////////////
// Database Models
const User = require('./models/user')
const Task = require('./models/task')
const Event = require('./models/event')


///////////////////////////////////
//backend schema validators
const { userSchema, eventSchema, taskSchema } = require('./schemas.js');

///////////////////////////////////
// Middleware
const app = express()
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())

///////////////////////////////////
//remote mongoose connection
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


///////////////////////////////////
//backend data entry validators
const validateEvent = (req, res, next) => {
    const { error } = eventSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

const validateTask = (req, res, next) => {
    const { error } = taskSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}


///////////////////////////////////
//Routes

app.get('/', async(req, res)=>{
    res.send("<h1>Welcome to the Primal Party.</h1>")
})

// GET	/events	View the events user created/got invited to 
app.get('/events', catchAsync(async(req, res) => {
	//const { adminId } = req.params;
	//const events = await Event.find({ admin: adminId})
	const events = await Event.find({})
	
	res.json( { events } )
}))

// GET	/events/:eventId View the details of a specific event
app.get('/events/:eventId', catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId)
	
	res.json({
		name: currEvent.name,
		description: currEvent.description,
		tags: currEvent.tags,
		address: currEvent.address,
		date: currEvent.date,
		admin: currEvent.admin
	})
}))

// GET	/events/:eventId/guests	View the guests of a specific event
app.get('/events/:eventId/guests', catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId)
	
	res.json({guests: currEvent.guests});
}))

// GET	/events/:eventId/tasks	View the tasks of a specific event
app.get('/events/:eventId/tasks', catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId)
	
	res.json({tasks: currEvent.tasks});
}))

// GET	/events/:eventId/tasks/:taskId	View the details of a particular task
app.get('/events/:eventId/tasks/:taskId', catchAsync(async(req, res) => {
	const { taskId } = req.params;
	const currTask = await Task.findById(taskId)
	
	res.json({
		name: currTask.name,
		description: currTask.description,
		assignees: currTask.assignees,
		done: currTask.done
	})
}))

//YOUR ENDPOINTS GO HERE. ORDER OF ROUTES IN EXPRESS MATTERS!!!!!! 
//YOUR ROUTE MIGHT NOT WORK JUST BECAUSE IT IS NOT IN THE CORRECT PLACE IN THE FILE


///////////////////////////////////
//Error endpoints

app.all('*', (req, res, next) => {
    next(new AppError('API endpoint is non-existent', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).json({'error' : err })
})

///////////////////////////////////
//starting the server
app.listen(8080, ()=>{
    console.log("listening on port 8080")
})