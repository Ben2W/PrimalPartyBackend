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


emailRouter.put('/forgot', catchAsync(async(req, res, next) => {
    if(req.isAuthenticated()){
        return res.json({status: 'ERROR: you are already logged in'});
    } 

    token = generateToken().toString();
    email = req.body.email;


    //@TODO: in the User Schema, keep track of when a resetToken was generated. To limit users from reseting passwords. IE: If a token was generated 10 seconds ago, deny this forgot password request.
    const user = await User.findOneAndUpdate({email: email, resetToken: token});
    console.log(user);
    res.json({token: token});
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