const userRouter = require('express').Router();
const User = require('../models/user')
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn} = require('../middleware.js')
const AppError =  require('../utils/AppError')

// Sets up sendgrid dependancies.
const sgMail = require('@sendgrid/mail')
require('dotenv').config()
const sgMAILAPI = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sgMAILAPI)
var crypto = require("crypto")

// @TODO Resend Token
// @TODO delete user (if an attacker is using someone else' email AND the user has not been authorized yet.)

/**
 * @TODO Make the token, a JWT 
 * 
 * 
 * @swagger
 * /register:
 *  post:
 *      description: Registers a user.
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                              description: the user's username, must be unique to any other username
 *                              example: myusername
 *                          password:
 *                              type: string
 *                              description: the user's password
 *                              example: mypassword
 *                          email:
 *                              type: string
 *                              description: the user's email, must be unique to any other username
 *                              example: example@gmail.com
 *                          firstName:
 *                              type: string
 *                              description: the user's first name
 *                              example: rick                       
 *                          lastName:
 *                              type: string
 *                              description: the user's last name
 *                              example: leinecker        
 *                          phone:
 *                              type: string
 *                              description: the user's phone number, must be 12 characters long
 *                              example: 199999999999
 * 
 *         
 *      responses:
 *          '200':
 *              description: email sent
 *          '500':
 *              description: there is an issue creating the account (this needs to be better)
 *          '501':
 *              description: email unable to be sent
 *          '410':
 *              description: username and email already taken
 *          '411':
 *              description: email already taken
 *          '412':
 *              description: username already taken
 *              
 */
 userRouter.post('/register', catchAsync(async(req, res, next) => {
    try {
        

        //Make sure the email and username are unique.
        const {username, email} = req.body
        const duplicateUsername = await User.exists({username: username});
        const duplicateEmail = await User.exists({email: email});

        if (duplicateEmail && duplicateUsername) return res.status(410).json({error: 'username and email already taken'})
        if (duplicateEmail) return res.status(411).json({error: 'email already taken'})
        if (duplicateUsername) return res.status(412).json({error: 'username already taken'})
 



        const {password, ...rest} = req.body
        const user = new User(rest);
        const registeredUser = await User.register(user, password);
        

        /**
         * Bypasses email authorization
         * 
         * Set BYPASS_EMAIL_AUTH = true in your enviornment variable to bypass email authorization
         * 
         */
        if(process.env.BYPASS_EMAIL_AUTH == 'true') {
            await user.updateOne({emailAuthenticated: true});
            return res.status(200).json({status: 'Registered account and authorized email'})
        } 

        // Generate the token and add it to the DB
        token = crypto.randomBytes(20).toString('hex');
        await user.updateOne({emailAuthToken: token, emailAuthTokenCreation: Date.now()});
        
        /*
        * Prepare the email.
        */
        const url = 'http://' + req.headers.host.toString() + /authorize/ + token.toString()
        const message = {
            to: email,
            from: 'no-reply@primaljet.com',
            templateId: 'd-23227d40a12040e8be6404e3f1fd9b4b',
            dynamicTemplateData: {
            name: user.username,
            link: url,
                },
            };
        
        
        //@TODO: Properly handle these errors.
        sgMail.send(message)
            .then(response => res.json({status: 'email sent'}))
        .catch(err => res.status(501).json({error: 'email cannot be sent'}));

    } catch (e) {
        return res.status(500).json({error: 'there has been an issue creating an account'})
    }
 }))


/**
 * @TODO Add another route to send another authorization token when you fail a login because the email isn't authorized
 * @TODO Check if the login information is correct, but if the email is not authorized (This might be really difficult to implement)
 * 
 * 
 * @swagger
 * /login:
 *  post:
 *      description: Logs in a user
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                              description: the user's username, must be unique to any other username
 *                              example: myusername
 *                          password:
 *                              type: string
 *                              description: the user's password
 *                              example: mypassword
 * 
 *         
 *      responses:
 *          '200':
 *              description: success
 *          '500':
 *              description: there is an issue logging @TODO make more responses
 *              
 */
userRouter.post('/login', (req, res, next) => {




  passport.authenticate('local', function(err, user, info) {
    if (err) { return res.json({error:'error happened when logging in1'}) }
    if (!user) { 
        return res.json({error:'error happened when logging in2'}

    ) }
    req.logIn(user, function(err) {
      if (err) { return res.json({error:'login failed'}) }
      return res.json({error:''})

    });
  })(req, res, next);
});

/**
 * @swagger
 * /resendauthorization:
 *  put:
 *      description: Sends another authorization email for user.
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
 *          '400':
 *              description: this email is already authenticated
 *          '401':
 *              description: user not found
 *          '402':
 *              description: please wait at least 15 seconds between sending emails
 *          '403':
 *              description: email invalid
 *              
 */
 userRouter.put('/resendauthorization', catchAsync(async(req, res, next) => {

    email = req.body.email;
    // @TODO: add more ways an email can be invalid
    if (email == undefined){
        return res.status(403).json({error: 'email invalid'});
    }


    //@TODO: This call is more efficient than findOne => updateOne, but findOneAndUpdate is automatically generating emails for some reason???
    //const user = await User.findOneAndUpdate({email: email, resetToken: token});

    const user = await User.findOne({email: email});
    if(!user){
        return res.status(401).json({error: 'user not found'});
    }

    if(user.emailAuthenticated){
        return res.status(400).json({error: 'this email is already authenticated'});
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

    if(Date.now() - user.emailAuthTokenCreation < spamCooldown){
        return res.status(402).json({error: 'please wait at least 15 seconds between sending emails'})
    }
    token = crypto.randomBytes(20).toString('hex');
    await user.updateOne({emailAuthToken: token, emailAuthTokenCreation: Date.now()});


    /*
    * Prepare the email.
    */
    const url = 'http://' + req.headers.host.toString() + /authorize/ + token.toString()
    const message = {
        to: email,
        from: 'no-reply@primaljet.com',
        templateId: 'd-23227d40a12040e8be6404e3f1fd9b4b',
        dynamicTemplateData: {
            name: user.username,
            link: url,
        },
    };


    //@TODO: Properly handle these errors.
    sgMail.send(message)
        .then(response => res.json({status: 'email sent'}))
    .catch(err => res.status(500).json({error: 'email cannot be sent'}));
})); 

/**
 * @swagger
 * /authorize/{token}:
 *  get:
 *      description: Checks if the authorization reset token is valid
 *      parameters:
 *          -   in: path
 *              name: token
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the authorization token, the token will look like http://primalparty.com/authorize/[token]"
 *          
 *      responses:
 *          '200':
 *              description: token valid
 *          '500':
 *              description: unexepected error
 *          '400':
 *              description: not a valid token
 *          '401':
 *              description: this token is expired
 */
 userRouter.get('/authorize/:token', catchAsync(async(req, res, next) => {


    console.log(req.params.token);
    const user = await User.findOne({emailAuthToken: req.params.token});

    if(!user){
        return res.status(400).json({error: 'this token is invalid'});
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

    if(expireTime + user.emailAuthTokenCreation.getTime()  < Date.now()){
        res.status(401).json({error: 'token expired'});
    }

    res.json({status: 'this token is valid'})

}));

/**
 * @swagger
 * /authorize/{token}:
 *  post:
 *      description: Authorizes a user to log in, using a token sent to the user's email.
 *      parameters:
 *          -   in: path
 *              name: token
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "the authorize token the token will look like http://primalparty.com/reset/[token]"
 *          
 *      responses:
 *          '200':
 *              description: success
 *          '500':
 *              description: unexepected error
 *          '400':
 *              description: user does not exist
 *          '401':
 *              description: token has expired
 *              
 */
 userRouter.post('/authorize/:token', catchAsync(async(req, res, next) => {
    const user = await User.findOne({emailAuthToken: req.params.token});

    if(!user){
        return res.status(400).json({error: 'this token is invalid'});
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
    if(expireTime + user.emailAuthTokenCreation.getTime()  < Date.now()){
        res.status(401).json({error: 'token expired'});
    }

    await user.updateOne({emailAuthenticated: true});

    
    req.login(user, err => {
        if (err) {
            return res.status(500).json({error: 'there has been an issue logging in to your account'})
        }
        res.status(200).json({error:''})
        
    })

}));

/**
 * @swagger
 * /protected:
 *  get:
 *      description: Tests to see if you are logged in      
 *      responses:
 *          '200':
 *              description: you are logged in
 *          '500':
 *              description: you do not have access to this page
 *              
 */
userRouter.get('/protected', isLoggedIn,  catchAsync(async(req, res, next) => {
    return res.json({ status: 'success' })
})); 


/**
 * @swagger
 * /logout:
 *  post:
 *      description: Logs the user out.     
 *      responses:
 *          '200':
 *              description: you successfully logged out
 *          '500':
 *              description: you are not authenticated
 *              
 */
userRouter.post('/logout', isLoggedIn, (req,res)=>{
    try{
        req.logout()
        return res.status(200).json({error:''})
    }catch(e){
        throw new AppError(e,500)
    }
})

module.exports = userRouter;