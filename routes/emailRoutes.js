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

var crypto = require("crypto")

/**
 * @swagger
 * /forgot:
 *  put:
 *      description: Reset a users password by sending them an email with a reset link.
 *      tags:
 *        - ResetPassword
 *        - Put
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                              description: the user's email
 *                              example: example@gmail.com
 *          
 *      responses:
 *          '200':
 *              description: success
 *          '500':
 *              description: unexepected error
 *          '503':
 *              description: email service unnavailable
 *          '403':
 *              description: you don't have permission to reset your password while already logged in
 *          '404':
 *              description: user not found
 *          '409':
 *              description: please wait at least 15 seconds between reseting passwords
 *          '412':
 *              description: email syntax invalid invalid
 *              
 */
emailRouter.put('/forgot', catchAsync(async(req, res, next) => {

    if(req.isAuthenticated()){
        return res.status(403).json({error: 'you are already logged in'});
    } 

   

    email = req.body.email;
    // @TODO: add more ways an email can be invalid
    if (email == undefined){
        return res.status(412).json({error: 'email syntax invalid'});
    }


    //@TODO: This call is more efficient than findOne => updateOne, but findOneAndUpdate is automatically generating emails for some reason???
    //const user = await User.findOneAndUpdate({email: email, resetToken: token});

    const user = await User.findOne({email: email});
    if(!user){
        return res.status(404).json({error: 'user not found'});
    }



    /* spamCooldown is a dev feature:
    *  set to 0 for no cooldown
    *  set to 15000 for a 15 second email cooldown:
    *  
    *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
    */
    spamCooldown = 1500
    if(process.env.RESET_SPAM_COOLDOWN != undefined){
        spamCooldown = process.env.RESET_SPAM_COOLDOWN
    }



    /*
    * If we are past the email cooldown, update the user in the DB with a generated reset token.
    */

    if(Date.now() - user.resetTokenCreation < spamCooldown){
        return res.status(409).json({error: 'please wait at least 15 seconds between reseting passwords'})
    }
    token = crypto.randomBytes(3).toString('hex');
    await user.updateOne({resetToken: token, resetTokenCreation: Date.now()});


    /*
    * Prepare the email.
    */
    //const url = 'http://' + req.headers.host.toString() + /reset/ + token.toString()
    const message = {
        to: email,
        from: 'no-reply@primalparty.com',
        templateId: 'd-e4e8ed898ae346a888e742ca2b954234',
        dynamicTemplateData: {
            name: user.username,
            code: token.toString(),
        },
    };


    //@TODO: Properly handle these errors.
    sgMail.send(message)
        .then(response => res.json({status: 'email sent'}))
    .catch(err => res.status(503).json({error: 'email cannot be sent'}));
})); 



/**
 * @swagger
 * /reset/{token}:
 *  get:
 *      description: Checks if the password reset token is valid
 *      tags:
 *        - ResetPassword
 *        - Get
 *      parameters:
 *          -   in: path
 *              name: token
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the token to reset a password via email, the token will look like http://primalparty.com/reset/[token]"
 *          
 *      responses:
 *          '200':
 *              description: token valid
 *          '500':
 *              description: unexepected error
 *          '404':
 *              description: not a valid token
 *          '410':
 *              description: this token is expired
 * 
 */
emailRouter.get('/reset/:token', catchAsync(async(req, res, next) => {


    console.log(req.params.token);
    const user = await User.findOne({resetToken: req.params.token});

    if(!user){
        return res.status(404).json({error: 'this user does not exist'});
    }


    /* 
    *  
    *  Set expire time to the amount of time a token is valid. Azure will use a environment variable so changing "expireTime" wont affect the remote server.
    *  
    *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
    */
    expireTime = 86400000 //1 day in ms
    if(process.env.EMAIL_RESET_EXPIRE_TIME != undefined){
        spamCooldown = process.env.EMAIL_RESET_EXPIRE_TIME
    }

    /*
    * If the token is expired, error.
    *
    */

    if(expireTime + user.resetTokenCreation.getTime()  < Date.now()){
        res.status(410).json({error: 'token expired'});
    }

    res.json({status: 'this token is valid'})

}));



/**
 * @swagger
 * /reset/{token}:
 *  post:
 *      description: Changes account associated with email with a password, given a reset token.
 *      tags:
 *        - ResetPassword
 *        - Post
 *      parameters:
 *          -   in: path
 *              name: token
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the token to reset a password via email, the token will look like http://primalparty.com/reset/[token]"
 *              
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          password:
 *                              type: string
 *                              description: the new password
 *                              example: newpassword
 *          
 *      responses:
 *          '200':
 *              description: success
 *          '500':
 *              description: unexepected error
 *          '404':
 *              description: user does not exist
 *          '410':
 *              description: token has expired
 *              
 */
emailRouter.post('/reset/:token', catchAsync(async(req, res, next) => {
    const user = await User.findOne({resetToken: req.params.token});

    if(!user){
        return res.status(404).json({error: 'this user does not exist'});
    }


     /* 
    *  
    *  Set expire time to the amount of time a token is valid. Azure will use a environment variable so changing "expireTime" wont affect the remote server.
    *  
    *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
    */
    expireTime = 86400000 //1 day in ms
    if(process.env.EMAIL_RESET_EXPIRE_TIME != undefined){
        spamCooldown = process.env.EMAIL_RESET_EXPIRE_TIME
    }

    /*
    * If the token is expired, error.
    *
    */
    if(expireTime + user.resetTokenCreation.getTime()  < Date.now()){
        res.status(410).json({error: 'token expired'});
    }

    await user.setPassword(req.body.password);
    await user.updateOne({resetToken: ''});
    await user.save()

    
    req.login(user, err => {
        if (err) {
            return res.status(500).json({error: 'there has been an issue logging in to your account'})
        }
        return res.json({ user })
        
    })

}));





module.exports = emailRouter;