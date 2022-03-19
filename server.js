///////////////////////////////////
// Requirements and dependencies
const express = require('express')
const session = require('express-session');
const path = require('path')
const cors = require('cors')
const mongoose = require('mongoose')
const AppError = require('./utils/AppError')
const catchAsync = require('./utils/catchAsync')
var passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo')(session);
//const {isLoggedIn} = require('./middleware') @TODO ADD THIS LINE


///////////////////////////////////
// Declaring route modules
var eventRoutes = require('./routes/eventRoutes');
var userRoutes = require('./routes/userRoutes');
var errorRoutes = require('./routes/errorRoutes');


///////////////////////////////////
// .env connections
require('dotenv').config()
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
//Session Setup

//@TODO REMOVE THIS LINE
// Currently, the authentication uses it's own database setup in ./config/database: have it use the same database ASAP


const sessionStore = new MongoStore({ 


    mongooseConnection: db, 
    collection: 'session' ,
    /*
    * Because we are technically not using MongoDB, and using CosmoDB, some functionality is a little different
    *
    * _ts is a CosmosDB specific field to determine the time expired, we don't have access to that since we are writing in "MongoCode"
    * 
    * So for us to implement time expired we have to do it a little unoptimally here source: (https://stackoverflow.com/questions/59638751/the-expireafterseconds-option-is-supported-on-ts-field-only-error-is-s)
    * 
    */

    ttl: 24 * 60 * 60 * 1000,
    autoRemove: 'interval',
    autoRemoveInterval: 10 // Value in minutes (default is 10)

});


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
	
	res.json({ currEvent });
}))

// GET	/events/:eventId/guests	View the guests of a specific event
app.get('/events/:eventId/guests', catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId).populate('guests')
	
	res.json({guests: currEvent.guests});
}))

// GET	/events/:eventId/tasks	View the tasks of a specific event
app.get('/events/:eventId/tasks', catchAsync(async(req, res) => {
	const { eventId } = req.params;
	const currEvent = await Event.findById(eventId).populate('tasks')
	
	res.json({tasks: currEvent.tasks});
}))

// GET	/events/:eventId/tasks/:taskId	View the details of a particular task
app.get('/events/:eventId/tasks/:taskId', catchAsync(async(req, res) => {
	const { taskId } = req.params;
	const currTask = await Task.findById(taskId)
	
	res.json({ currTask });
}))


app.use(session({

    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 //Equals 1 day
    }
}))

///////////////////////////////////
//Passport Authentication

//We want to reinitialize the passport middleware everytime we load a route: if a session expires or a user logs out it will get caught.
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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
//Routes

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

app.use(userRoutes);

app.use(eventRoutes);


///////////////////////////////////
//Error endpoints
app.use(errorRoutes);

///////////////////////////////////
//starting the server
app.listen(8080, ()=>{
    console.log("listening on port 8080")
})