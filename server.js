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



//YOUR ENDPOINTS GO HERE. ORDER OF ROUTES IN EXPRESS MATTERS!!!!!! 
//YOUR ROUTE MIGHT NOT WORK JUST BECAUSE IT IS NOT IN THE CORRECT PLACE IN THE FILE

//Create a new event
app.post('/events', catchAsync(async(req, res)=>{

    const {name, description, tags, address, date, admin, guests, tasks} = req.body;
    const newEvent = new Event({name : name, description : description, tags : tags, address : address, date : date, admin : admin, guests : guests, tasks : tasks});
    await newEvent.save();
    
    res.json(200);
}))


//Add a guest to an event
//Checks if the guest is already in the event and adds them if not
app.post('/events/:eventId/guests/:guestId', catchAsync(async(req, res)=>{

    const {eventId, guestId} = req.params;
    const event = await Event.findById(eventId);
    
    if(event.guests.indexOf(guestId) != -1)
    { 
        throw new AppError ("Guest already found in guest list", 300);
    };

    event.guests.push(guestId);
    event.save();
    res.json(200);
}))

//Delete a guest from an event
//Checks if the guest is in the list and deletes it based on index if so
app.delete('/events/:eventId/guests/:guestId', catchAsync(async(req, res)=>{

    const {eventId, guestId} = req.params;
    const event = await Event.findById(eventId);
    const guestIndex = event.guests.indexOf(guestId);
    
    if(guestIndex == -1)
    { 
        throw new AppError ("Guest not found", 300);
    };

    event.guests.splice(guestIndex, 1);
    event.save();
    res.json(200);
}))

//Delete a task from an event
//Checks if the task is in the list and deletes it based on index if so
app.delete('/events/:eventId/tasks/:taskId', catchAsync(async(req, res)=>{

    const {eventId, taskId} = req.params;
    const event = await Event.findById(eventId);
    const taskIndex = event.tasks.indexOf(taskId);
    
    if(taskIndex == -1)
    { 
        throw new AppError ("task not found", 300);
    };

    event.tasks.splice(taskIndex, 1);
    event.save();
    res.json(200);
}))


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