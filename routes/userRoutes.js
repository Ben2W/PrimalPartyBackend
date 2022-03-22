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
// @TODO Approve token

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
 *              description: success
 *          '500':
 *              description: there is an issue creating the account (this needs to be better)
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

        /* spamCooldown is a dev feature:
        *  set to 0 for no cooldown
        *  set to 15000 for a 15 second email cooldown:
        *  
        *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
        *             
        */
        spamCooldown = 1500

        if(process.env.RESET_SPAM_COOLDOWN != undefined){
            spamCooldown = process.env.RESET_SPAM_COOLDOWN
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

    } catch (e) {

        return res.status(500).json({error: 'there has been an issue creating an account'})
    }
 }))


/**
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
    
    if (err) { return res.json({error:'error happened when logging in'}) }
    if (!user) { return res.json({error:'error happened when logging in'}) }
    req.logIn(user, function(err) {
      if (err) { return res.json({error:'login failed'}) }
      return res.json({error:''})

    });
  })(req, res, next);
});



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