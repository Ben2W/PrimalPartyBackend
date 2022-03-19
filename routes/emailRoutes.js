const emailRouter = require('express').Router();
const User = require('../models/user')
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn} = require('../middleware.js')
const AppError =  require('../utils/AppError')

const express = require('express')
emailRouter.use(express.urlencoded({extended:true}))
emailRouter.use(express.json())


function generateToken() {
    var buf = new Buffer.alloc(16);
    for (var i = 0; i < buf.length; i++) {
        buf[i] = Math.floor(Math.random() * 256);
    }
    var id = buf.toString('base64');
    return id;
}


emailRouter.post('/forgot', catchAsync(async(req, res, next) => {
    if(req.isAuthenticated()){
        return res.json({status: 'ERROR: you are already logged in'});
    } 
    token = generateToken();
    //const currEvent = await User.findById(eventId).populate('tasks')
    res.json({emai: 'bewerner23@gmail.com'});
})); 



// emailRouter.get('/forgot', function (req, res) {
//     if (req.isAuthenticated()) {
//         //user is alreay logged in
//         return res.redirect('/');
//     }

//     //UI with one input for email
//     console.log("FORGOT")
// });



module.exports = emailRouter;