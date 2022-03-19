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
    { "_id" : "62301640a3c63429650da077", "firstName" : "Emin", "lastName" : "Mammadzada", "username" : "emin2002", "hash" : "9bce7619a267dc79e1fc2dad8204e1738cab9ea6cf0c0a39e16ec33133fa499ea049a529e57488eb0e46e61b1661463a617f87181da8a4678055a8ded562aee5fef4e354b59a98663b5a4ddcca4b1793219f04bfbfaa10d1c71feaea7d9d3f1528dc1ababf77f2a32dfb800965763934f061f438a50f83020a6674328ec88acc0f694076b9c19f76250ded4a8d7314ecec3504bdd6dfee97afc105bef3704038f7c3c71d5057a058c177decbbc772bdbe0c14374314870469c30dc790f131ce19b38816c73f1cd87b87dc0d45774af7ae76e95a6c4d7ed48d93d8b1da4640be9ba488f3a96e1cc0119060f2942a9e3d16231c3cfb372495aef19211b32e8aac4f3c5d79bda81aa69d5a1cb5d1c4bf0fc65cf1d9a67fb427f0bc5aa91373fb4a194369e0622c2d446aaf8124a0f93e3b607a29ec736051c4b6058443d8a42128e77beaf79b52124b89fa4bf4c4860bc895fab4e05fcd63698319d8e3861247f7e13fc7056a484a102f9a9b7407f5aa69b7d833949db6be2fd8e328cdadbe96f1312cad69c214982502db2ca61254d05e5e391b8db56605abb92cf7220678c5180d98bce2446a68efca23f09178976db4bb5da088ff42b89e7e807c5c6b68f084248c418acf8be7567b890eda1d3270da608055755c63a70b246e892b38b28b424a88edf7352f6c96e88dc943c7ebde5a09b19cba1b9f66fe28c77b92a643a45a9", "phone" : "+14077574245", "email" : "eminmamedzade37@gmail.com", "friends" : ["62301640a3c63429650da07c"], "events" : ["623018e31d596470d49769e0","623018e31d596470d49769e3"], "__v" : 0 }
    ,{ "_id" : "62301640a3c63429650da07a", "firstName" : "Tom", "lastName" : "Hardy", "username" : "tomhardy", "hash" : "9bce7619a267dc79e1fc2dad8204e1738cab9ea6cf0c0a39e16ec33133fa499ea049a529e57488eb0e46e61b1661463a617f87181da8a4678055a8ded562aee5fef4e354b59a98663b5a4ddcca4b1793219f04bfbfaa10d1c71feaea7d9d3f1528dc1ababf77f2a32dfb800965763934f061f438a50f83020a6674328ec88acc0f694076b9c19f76250ded4a8d7314ecec3504bdd6dfee97afc105bef3704038f7c3c71d5057a058c177decbbc772bdbe0c14374314870469c30dc790f131ce19b38816c73f1cd87b87dc0d45774af7ae76e95a6c4d7ed48d93d8b1da4640be9ba488f3a96e1cc0119060f2942a9e3d16231c3cfb372495aef19211b32e8aac4f3c5d79bda81aa69d5a1cb5d1c4bf0fc65cf1d9a67fb427f0bc5aa91373fb4a194369e0622c2d446aaf8124a0f93e3b607a29ec736051c4b6058443d8a42128e77beaf79b52124b89fa4bf4c4860bc895fab4e05fcd63698319d8e3861247f7e13fc7056a484a102f9a9b7407f5aa69b7d833949db6be2fd8e328cdadbe96f1312cad69c214982502db2ca61254d05e5e391b8db56605abb92cf7220678c5180d98bce2446a68efca23f09178976db4bb5da088ff42b89e7e807c5c6b68f084248c418acf8be7567b890eda1d3270da608055755c63a70b246e892b38b28b424a88edf7352f6c96e88dc943c7ebde5a09b19cba1b9f66fe28c77b92a643a45a9", "phone" : "+18001234567", "email" : "tomhardy@gmail.com", "friends" : ["62301640a3c63429650da07e"], "events" : ["623018e31d596470d49769e3" ], "__v" : 0 }
    ,{ "_id" : "62301640a3c63429650da07c", "firstName" : "Benjamin", "lastName" : "W", "username" : "benw", "hash" : "9bce7619a267dc79e1fc2dad8204e1738cab9ea6cf0c0a39e16ec33133fa499ea049a529e57488eb0e46e61b1661463a617f87181da8a4678055a8ded562aee5fef4e354b59a98663b5a4ddcca4b1793219f04bfbfaa10d1c71feaea7d9d3f1528dc1ababf77f2a32dfb800965763934f061f438a50f83020a6674328ec88acc0f694076b9c19f76250ded4a8d7314ecec3504bdd6dfee97afc105bef3704038f7c3c71d5057a058c177decbbc772bdbe0c14374314870469c30dc790f131ce19b38816c73f1cd87b87dc0d45774af7ae76e95a6c4d7ed48d93d8b1da4640be9ba488f3a96e1cc0119060f2942a9e3d16231c3cfb372495aef19211b32e8aac4f3c5d79bda81aa69d5a1cb5d1c4bf0fc65cf1d9a67fb427f0bc5aa91373fb4a194369e0622c2d446aaf8124a0f93e3b607a29ec736051c4b6058443d8a42128e77beaf79b52124b89fa4bf4c4860bc895fab4e05fcd63698319d8e3861247f7e13fc7056a484a102f9a9b7407f5aa69b7d833949db6be2fd8e328cdadbe96f1312cad69c214982502db2ca61254d05e5e391b8db56605abb92cf7220678c5180d98bce2446a68efca23f09178976db4bb5da088ff42b89e7e807c5c6b68f084248c418acf8be7567b890eda1d3270da608055755c63a70b246e892b38b28b424a88edf7352f6c96e88dc943c7ebde5a09b19cba1b9f66fe28c77b92a643a45a9", "phone" : "+18001112233", "email" : "benw@gmail.com", "friends" : ["62301640a3c63429650da077", "62301640a3c63429650da07e"], "events" : ["623018e31d596470d49769e0", "623018e31d596470d49769e3"], "__v" : 0 }
    ,{ "_id" : "62301640a3c63429650da07e", "firstName" : "Richard", "lastName" : "Leinecker", "username" : "RickL", "hash" : "9bce7619a267dc79e1fc2dad8204e1738cab9ea6cf0c0a39e16ec33133fa499ea049a529e57488eb0e46e61b1661463a617f87181da8a4678055a8ded562aee5fef4e354b59a98663b5a4ddcca4b1793219f04bfbfaa10d1c71feaea7d9d3f1528dc1ababf77f2a32dfb800965763934f061f438a50f83020a6674328ec88acc0f694076b9c19f76250ded4a8d7314ecec3504bdd6dfee97afc105bef3704038f7c3c71d5057a058c177decbbc772bdbe0c14374314870469c30dc790f131ce19b38816c73f1cd87b87dc0d45774af7ae76e95a6c4d7ed48d93d8b1da4640be9ba488f3a96e1cc0119060f2942a9e3d16231c3cfb372495aef19211b32e8aac4f3c5d79bda81aa69d5a1cb5d1c4bf0fc65cf1d9a67fb427f0bc5aa91373fb4a194369e0622c2d446aaf8124a0f93e3b607a29ec736051c4b6058443d8a42128e77beaf79b52124b89fa4bf4c4860bc895fab4e05fcd63698319d8e3861247f7e13fc7056a484a102f9a9b7407f5aa69b7d833949db6be2fd8e328cdadbe96f1312cad69c214982502db2ca61254d05e5e391b8db56605abb92cf7220678c5180d98bce2446a68efca23f09178976db4bb5da088ff42b89e7e807c5c6b68f084248c418acf8be7567b890eda1d3270da608055755c63a70b246e892b38b28b424a88edf7352f6c96e88dc943c7ebde5a09b19cba1b9f66fe28c77b92a643a45a9", "phone" : "+18006667788", "email" : "rickl@gmail.com", "friends" : ["62301640a3c63429650da07c","62301640a3c63429650da07a"], "events" : ["623018e31d596470d49769e0","623018e31d596470d49769e3"], "__v" : 0 }
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

   mongoose.connection.close()
}


seed()