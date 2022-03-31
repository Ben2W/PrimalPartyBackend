///////////////////////////////////
// Requirements and dependencies
const express = require('express')
const session = require('express-session');
const cors = require('cors')
const mongoose = require('mongoose')

const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo')(session);

///////////////////////////////////
// Declaring routers
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const errorRoutes = require('./routes/errorRoutes');
const emailRoutes = require('./routes/emailRoutes');
const swaggerRoutes = require('./routes/swaggerRoutes');


///////////////////////////////////
// .env connections
require('dotenv').config()
const url = process.env.MONGOURL
const secret = process.env.SECRET


///////////////////////////////////
// Database Models
const User = require('./models/user')


///////////////////////////////////
// Middleware
const app = express()
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://black-ocean-0eed1b40f.1.azurestaticapps.net'],
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus:200,
}))

app.use(express.urlencoded({extended:true}))
app.use(express.json())


// middleware to have access to current user in every request
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

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
//Session Setup

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

app.use(session({

    secret: secret,
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


///////////////////////////////////
//Routes

app.use(swaggerRoutes);

app.use(userRoutes);

app.use(emailRoutes);

app.use(eventRoutes);

app.use(errorRoutes);

///////////////////////////////////
//starting the server
app.listen(8080, ()=>{
    console.log("listening on port 8080")
})

///////////////////////////////////
// Required for unit testing
module.exports = app;