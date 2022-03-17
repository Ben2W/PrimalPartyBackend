//this file was used to create dummy data



const mongoose = require('mongoose')

const User = require('../models/user')
const Task = require('../models/task')
const Event = require('../models/event')


//remote mongoose connection
mongoose.connect('mongodb://bwerner:uK4iJLMqnv1yElCkpFUU53loTSljAkj4EtAC4YqMtMW2rZXIOaU9Qsb4CxL9lU3WfYFqec953ZBa1mCNWMQncw==@bwerner.mongo.cosmos.azure.com:10255/primalparty?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@bwerner@', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const seed = async() => {
    await Task.deleteMany({})
    await Event.deleteMany({})
    await User.deleteMany({})

    await User.insertMany([
        { "_id" : "62301640a3c63429650da077", "firstName" : "Emin", "lastName" : "Mammadzada", "login" : "emin2002", "password" : "password123", "phone" : "+14077574245", "email" : "eminmamedzade37@gmail.com", "friends" : ["62301640a3c63429650da07c"], "events" : ["623018e31d596470d49769e0","623018e31d596470d49769e3"], "__v" : 0 }
    ,{ "_id" : "62301640a3c63429650da07a", "firstName" : "Tom", "lastName" : "Hardy", "login" : "tomhardy", "password" : "password123", "phone" : "+18001234567", "email" : "tomhardy@gmail.com", "friends" : ["62301640a3c63429650da07e"], "events" : ["623018e31d596470d49769e3" ], "__v" : 0 }
    ,{ "_id" : "62301640a3c63429650da07c", "firstName" : "Benjamin", "lastName" : "W", "login" : "benw", "password" : "password123", "phone" : "+18001112233", "email" : "benw@gmail.com", "friends" : ["62301640a3c63429650da077", "62301640a3c63429650da07e"], "events" : ["623018e31d596470d49769e0", "623018e31d596470d49769e3"], "__v" : 0 }
    ,{ "_id" : "62301640a3c63429650da07e", "firstName" : "Richard", "lastName" : "Leinecker", "login" : "RickL", "password" : "password123", "phone" : "+18006667788", "email" : "rickl@gmail.com", "friends" : ["62301640a3c63429650da07c","62301640a3c63429650da07a"], "events" : ["623018e31d596470d49769e0","623018e31d596470d49769e3"], "__v" : 0 }

    ])


    await Event.insertMany([
        { "_id" : "623018e31d596470d49769e0", "name" : "Corporate Celebration @PrimalParty", "description" : "celebrating first steps at PrimalParty headquarters", "tags" : [ "corporate", "fun" ], "address" : "12800 Pegasus Dr, Orlando, FL 32816", "date" : "03/17/2022 18:00:00", "admin" : "62301640a3c63429650da07c", "guests" : [ "62301640a3c63429650da077", "62301640a3c63429650da07e"], "tasks" : [ "62301add4b726d21ce36c28f", "62301add4b726d21ce36c296", "62301add4b726d21ce36c29a" ]},
        { "_id" : "623018e31d596470d49769e3", "name" : "Tom Hardy's bd party", "description" : "Celebrating my 45-th birthday yaay!", "tags" : [ "birthday", "social", "fun" ], "address" : "Hammersmith, London, UK", "date" : "09/15/2022 00:00:00", "admin" : "62301640a3c63429650da07a", "guests" : [ "62301640a3c63429650da07e", "62301640a3c63429650da077", "62301640a3c63429650da07c" ], "tasks" : [ "62301add4b726d21ce36c292", "62301add4b726d21ce36c294","62301add4b726d21ce36c298" ]}
    ])

    await Task.insertMany([
        { "_id" : "62301add4b726d21ce36c28f", "event" : "623018e31d596470d49769e0", "name" : "Speakers", "description" : "Need Speakers for a big corporate party", "assignees" : [ "62301640a3c63429650da07c" ], "done" : false, "__v" : 0 },
        { "_id" : "62301add4b726d21ce36c292", "event" : "623018e31d596470d49769e3", "name" : "Vodka", "description" : "no alcohol - no bd:", "assignees" : [ "62301640a3c63429650da077", "62301640a3c63429650da07a" ], "done" : false, "__v" : 0 },
        { "_id" : "62301add4b726d21ce36c294", "event" : "623018e31d596470d49769e3", "name" : "Snacks", "description" : "gotta snack while drinking", "assignees" : [ "62301640a3c63429650da07c", "62301640a3c63429650da077" ], "done" : true, "__v" : 0 },
        { "_id" : "62301add4b726d21ce36c296", "event" : "623018e31d596470d49769e0", "name" : "Games", "description" : "work environment friednly games", "assignees" : [ "62301640a3c63429650da07e" ], "done" : true, "__v" : 0 },
        { "_id" : "62301add4b726d21ce36c298", "event" : "623018e31d596470d49769e3", "name" : "Cute Dogs", "description" : "it is my [Tom Hardy] bd, and I want some goldens", "assignees" : [ "62301640a3c63429650da07e" ], "done" : false, "__v" : 0 },
        { "_id" : "62301add4b726d21ce36c29a", "event" : "623018e31d596470d49769e0", "name" : "professional camera", "description" : "save our memories", "assignees" : [ "62301640a3c63429650da077" ], "done" : false, "__v" : 0 }
    ])
}


seed()