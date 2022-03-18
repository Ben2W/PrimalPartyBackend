///////////////////////////////////
// Requirements and dependencies
const express = require('express')
const path = require('path')
const cors = require('cors')
const mongoose = require('mongoose')
const AppError = require('./utils/AppError')
const catchAsync = require('./utils/catchAsync')

///////////////////////////////////
// Requirements and dependencies for passport
var crypto = require('crypto');
const session = require('express-session');
var passport = require('passport');
const MongoStore = require('connect-mongo')(session);
require('./config/passport');


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
const connection = require('./config/database');


const sessionStore = new MongoStore({ 

    mongooseConnection: connection, 
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


app.use(session({

    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 //Equals 1 day
    }

}))

///////////////////////////////////
//Passport Authentication

//We want to reinitialize the passport middleware everytime we load a route: if a session expires or a user logs out it will get caught.
app.use(passport.initialize());
app.use(passport.session());

///////////////////////////////////
//Routes
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