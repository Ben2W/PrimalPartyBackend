const User = require('../models/user')
const Task = require('../models/task')
const Event = require('../models/event')
const express = require('express')
const app = express()
const url = process.env.MONGOURL

const mongoose = require('mongoose')
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const reset = async () => {
    await User.deleteMany({})
    await Task.deleteMany({})
    await Event.deleteMany({})
}

reset()
.then(()=>{
    console.log("deleted everything")
})
.catch(e=>{
    console.log(`Error happened: ${e}`)
})

