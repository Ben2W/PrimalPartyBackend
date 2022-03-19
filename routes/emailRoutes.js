const emailRouter = require('express').Router();
const User = require('../models/user')
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn} = require('../middleware.js')
const AppError =  require('../utils/AppError')

const express = require('express')
emailRouter.use(express.urlencoded({extended:true}))
emailRouter.use(express.json())

// Sets up sendgrid dependancies.
const sgMail = require('@sendgrid/mail')
require('dotenv').config()
const sgMAILAPI = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sgMAILAPI)






/*
* Generates a token the user will receive via email if they request a password change.
*
*/
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

    const message = {
        to: 'bewerner23@gmail.com',
        from: 'no-reply@primaljet.com',
        templateId: 'd-e4e8ed898ae346a888e742ca2b954234',
        dynamicTemplateData: {
            name: user.username,
            link: token,
        },
    };




    sgMail.send(message)
        .then(response => res.json({status: 'email sent'}))
    .catch(err => res.json({status: 'error: email not sent'}));
})); 

module.exports = emailRouter;