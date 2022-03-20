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

var crypto = require("crypto")




emailRouter.put('/forgot', catchAsync(async(req, res, next) => {

    if(req.isAuthenticated()){
        return res.status(500).json({error: 'you are already logged in'});
    } 

   

    email = req.body.email;


    //@TODO: This call is more efficient than findOne => updateOne, but findOneAndUpdate is automatically generating emails for some reason???
    //const user = await User.findOneAndUpdate({email: email, resetToken: token});

    const user = await User.findOne({email: email});
    if(!user){
        return res.status(500).json({error: 'user not found'});
    }



    /* spamCooldown is a dev feature:
    *  set to 0 for no cooldown
    *  set to -1 to skip sgMail.send
    *  set to 15000 for a 15 second email cooldown:
    *  
    *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
    */
    spamCooldown = -1
    if(process.env.RESET_SPAM_COOLDOWN != undefined){
        spamCooldown = process.env.RESET_SPAM_COOLDOWN
    }



    /*
    * If we are past the email cooldown, update the user in the DB with a generated reset token.
    */

    if(Date.now() - user.resetTokenCreation < spamCooldown){
        return res.status(500).json({error: 'cannot reset password at this moment'})
    }
    token = crypto.randomBytes(20).toString('hex');
    await user.updateOne({resetToken: token, resetTokenCreation: Date.now()});


    /*
    * Prepare the email.
    */
    const url = 'http://' + req.headers.host.toString() + /reset/ + token.toString()
    const message = {
        to: 'bewerner23@gmail.com',
        from: 'no-reply@primaljet.com',
        templateId: 'd-e4e8ed898ae346a888e742ca2b954234',
        dynamicTemplateData: {
            name: user.username,
            link: url,
        },
    };


    /*
    * Send the email using sgMail
    * *NOTE* If we set spamCooldown to -1, skip sending the email and the JSON response will be the link.
    */
    if(spamCooldown == -1) {
        return res.json({status: url})
    }
    //@TODO: Properly handle these errors.
    sgMail.send(message)
        .then(response => res.json({status: 'email sent'}))
    .catch(err => res.status(500).json({error: 'email cannot be sent'}));
})); 




emailRouter.get('/reset/:token', catchAsync(async(req, res, next) => {

    const user = await User.findOne({resetToken: req.params.token});

    if(!user){
        return res.json({status: 'this user does not exist'});
    }


    /* 
    *  
    *  Set expire time to the amount of time a token is valid. Azure will use a environment variable so changing "expireTime" wont affect the remote server.
    *  
    *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
    */
    expireTime = 86400000 //1 day in ms
    if(process.env.EMAIL_RESET_EXPIRE_TIME !== 'undefined'){
        spamCooldown = process.env.EMAIL_RESET_EXPIRE_TIME
    }

    /*
    * If the token is expired, error.
    *
    */

    if(expireTime + user.resetTokenCreation.getTime()  < Date.now()){
        return res.json({status: 'token has expired'})
    }

    res.json({status: 'this token is valid'})

}));




emailRouter.post('/reset/:token', catchAsync(async(req, res, next) => {
    const user = await User.findOne({resetToken: req.params.token});

    if(!user){
        return res.json({status: 'this user does not exist'});
    }


     /* 
    *  
    *  Set expire time to the amount of time a token is valid. Azure will use a environment variable so changing "expireTime" wont affect the remote server.
    *  
    *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
    */
    expireTime = 86400000 //1 day in ms
    if(process.env.EMAIL_RESET_EXPIRE_TIME !== 'undefined'){
        spamCooldown = process.env.EMAIL_RESET_EXPIRE_TIME
    }

    /*
    * If the token is expired, error.
    *
    */
    if(expireTime + user.resetTokenCreation.getTime()  < Date.now()){
        return res.json({status: 'token has expired'})
    }

    await user.setPassword(req.body.password);
    await user.updateOne({resetToken: ''});
    await user.save()

    
    req.login(user, err => {
        if (err) {
            return res.status(500).json({error: 'there has been an issue logging in to your account'})
        }
        res.status(200).json({error:''})
        
    })

}));





module.exports = emailRouter;