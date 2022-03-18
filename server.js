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

//Deletes an event based on the event $oid
app.post('/DeleteEvent', async(req, res)=>{
   await Event.findOneAndDelete(req.body.eventID);
    /*const eventID = req.body.eventID;
    const query = await Event.findOneAndDelete({ $oid : eventID});

    if(!query.length){ 
        throw new Error('Event not found');
        return;
        }
    
    console.log(JSON.stringify(query));
    res.json(query);
    */
});


app.post('/CreateEvent', async(req, res)=>{
    const name = req.body.name;
    const description = req.body.description;
    const tags = req.body.tags;
    const address = req.body.address;
    const date = req.body.date;
    const admin = req.body.admin;
    const guests = req.body.guests;
    const tasks = req.body.tasks;

    const newEvent = new Event({name : name, description : description, tags : tags, address : address, date : date, admin : admin, guests : guests, tasks : tasks});
    await newEvent.save();
    
    res.send(200 + "Event successfully created");
})


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