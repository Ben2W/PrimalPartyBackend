const userRouter = require('express').Router();
const User = require('../models/user')
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware.js')
const AppError = require('../utils/AppError')

// Sets up sendgrid dependancies.
const sgMail = require('@sendgrid/mail')
require('dotenv').config()
const sgMAILAPI = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sgMAILAPI)
var crypto = require("crypto");

const validator = require("email-validator");


// @TODO Resend Token
// @TODO delete user (if an attacker is using someone else' email AND the user has not been authorized yet.)

//Registers a user.
/**
 * @TODO Make the token, a JWT 
 * 
 * 
 * @swagger
 * /register:
 *  post:
 *      description: Registers a user.
 *      tags:
 *        - UserAuthentication
 *        - Post
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
 *          '503':
 *              description: email unable to be sent
 *          '410':
 *              description: username and email already taken
 *          '411':
 *              description: email already taken
 *          '412':
 *              description: username already taken
 *              
 */
function validatePhoneNumber(input_str) {
    let re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;

    return re.test(input_str);
}

userRouter.post('/register', catchAsync(async (req, res, next) => {
    try {

        //Make sure the email and username are unique.
        const { username, email, phone } = req.body

        if (!validatePhoneNumber(phone)) {
            return res.status(415).json({ error: 'invalid phone number' })
        }

        if (!validator.validate(email)) {
            return res.status(414).json({ error: 'invalid email' })
        }

        const duplicateUsername = await User.exists({ username: username });
        const duplicateEmail = await User.exists({ email: email });
        const duplicatePhone = await User.exists({ phone: phone })

        if (duplicateEmail && duplicateUsername && duplicatePhone) return res.status(410).json({ error: 'username, phone, and email already taken' })
        if (duplicateEmail) return res.status(411).json({ error: 'email already taken' })
        if (duplicateUsername) return res.status(412).json({ error: 'username already taken' })
        if (duplicatePhone) return res.status(413).json({ error: 'phone already taken' })


        const { password, ...rest } = req.body
        const user = new User(rest);
        const registeredUser = await User.register(user, password);


        /**
         * Bypasses email authorization
         * 
         * Set BYPASS_EMAIL_AUTH = true in your enviornment variable to bypass email authorization
         * 
         */

        if (process.env.BYPASS_EMAIL_AUTH == 'true') {
            await user.updateOne({ emailAuthenticated: true });
            return res.status(200).json({ status: 'Registered account and authorized email' })
        }

        // Generate the token and add it to the DB
        token = crypto.randomBytes(3).toString('hex');
        await user.updateOne({ emailAuthToken: token, emailAuthTokenCreation: Date.now() });

        /*
        * Prepare the email.
        */
        //const url = 'http://' + req.headers.host.toString() + /authorize/ + token.toString()
        const message = {
            to: email,
            from: 'no-reply@primaljet.com',
            templateId: 'd-23227d40a12040e8be6404e3f1fd9b4b',
            dynamicTemplateData: {
                name: user.username,
                code: token.toString(),
            },
        };


        //@TODO: Properly handle these errors.
        sgMail.send(message)
            .then(response => res.json({ status: 'email sent' }))
            .catch(err => res.status(501).json({ error: 'email cannot be sent' }));

    } catch (e) {
        return res.status(500).json({ error: 'there has been an issue creating an account' })
    }
}))

//Logs in a user
/**
 * @TODO Add another route to send another authorization token when you fail a login because the email isn't authorized
 * @TODO Check if the login information is correct, but if the email is not authorized (This might be really difficult to implement)
 * 
 * 
 * @swagger
 * /login:
 *  post:
 *      description: Logs in a user
 *      tags:
 *        - UserAuthentication
 *        - Post
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
 *              description: success; returns user details
 *          '500':
 *              description: there is an issue logging @TODO make more responses
 *          '400':
 *              description: This user could not be found OR Wrong Password OR Email needs to be authenticated    
 */
userRouter.post('/login', (req, res, next) => {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return res.status(500).json({ error: 'there is an issue logging in' }) }

        // This error throws if email is not authorized OR the username is not valid
        if (!user) { return res.status(400).json({ error: 'This user could not be found OR Wrong Password OR Email needs to be authenticated' }) }
        req.logIn(user, function (err) {
            if (err) { return res.status(500).json({ error: 'there is an issue logging in' }) }
            return res.json({ user })
        });
    })(req, res, next);
});

//Sends another authorization email for user.
/**
 * @swagger
 * /resendauthorization:
 *  put:
 *      description: Sends another authorization email for user.
 *      tags:
 *        - UserAuthentication
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
 *          '410':
 *              description: this email is already authenticated
 *          '404':
 *              description: user not found
 *          '409':
 *              description: please wait at least 15 seconds between sending emails
 *          '412':
 *              description: email invalid
 *              
 */
userRouter.put('/resendauthorization', catchAsync(async (req, res, next) => {

    email = req.body.email;
    // @TODO: add more ways an email can be invalid
    if (email == undefined) {
        return res.status(412).json({ error: 'email invalid' });
    }


    //@TODO: This call is more efficient than findOne => updateOne, but findOneAndUpdate is automatically generating emails for some reason???
    //const user = await User.findOneAndUpdate({email: email, resetToken: token});

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(404).json({ error: 'user not found' });
    }

    if (user.emailAuthenticated) {
        return res.status(410).json({ error: 'this email is already authenticated' });
    }


    /* spamCooldown is a dev feature:
    *  set to 0 for no cooldown
    *  set to 15000 for a 15 second email cooldown:
    *  
    *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
    */
    spamCooldown = 1500
    if (process.env.RESET_SPAM_COOLDOWN != undefined) {
        spamCooldown = process.env.RESET_SPAM_COOLDOWN
    }



    /*
    * If we are past the email cooldown, update the user in the DB with a generated reset token.
    */

    if (Date.now() - user.emailAuthTokenCreation < spamCooldown) {
        return res.status(409).json({ error: 'please wait at least 15 seconds between sending emails' })
    }
    token = crypto.randomBytes(20).toString('hex');
    await user.updateOne({ emailAuthToken: token, emailAuthTokenCreation: Date.now() });


    /*
    * Prepare the email.
    */
    //const url = 'http://' + req.headers.host.toString() + /authorize/ + token.toString()
    const message = {
        to: email,
        from: 'no-reply@primaljet.com',
        templateId: 'd-23227d40a12040e8be6404e3f1fd9b4b',
        dynamicTemplateData: {
            name: user.username,
            code: token.toString(),
        },
    };


    //@TODO: Properly handle these errors.
    sgMail.send(message)
        .then(response => res.json({ status: 'email sent' }))
        .catch(err => res.status(503).json({ error: 'email cannot be sent' }));
}));

/**
 * @swagger
 * /authorize/{token}:
 *  get:
 *      description: Checks if the authorization reset token is valid
 *      tags:
 *        - UserAuthentication
 *        - Get
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
 *          '404':
 *              description: not a valid token
 *          '410':
 *              description: this token is expired
 */
userRouter.get('/authorize/:token', catchAsync(async (req, res, next) => {


    console.log(req.params.token);
    const user = await User.findOne({ emailAuthToken: req.params.token });

    if (!user) {
        return res.status(404).json({ error: 'this token is invalid' });
    }


    /* 
    *  
    *  Set expire time to the amount of time a token is valid. Azure will use a environment variable so changing "expireTime" wont affect the remote server.
    *  
    *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
    */
    expireTime = 86400000 //1 day in ms
    if (process.env.EMAIL_RESET_EXPIRE_TIME != undefined) {
        spamCooldown = process.env.EMAIL_RESET_EXPIRE_TIME
    }

    /*
    * If the token is expired, error.
    *
    */

    if (expireTime + user.emailAuthTokenCreation.getTime() < Date.now()) {
        res.status(410).json({ error: 'token expired' });
    }

    res.json({ status: 'this token is valid' })

}));

/**
 * @swagger
 * /authorize/{token}:
 *  post:
 *      description: Authorizes a user to log in, using a token sent to the user's email.
 *      tags:
 *        - UserAuthentication
 *        - Post
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
 *              description: user authenticated and logged in
 *          '500':
 *              description: unexepected error
 *          '400':
 *              description: user does not exist
 *          '410':
 *              description: token has expired
 *              
 */
userRouter.post('/authorize/:token', catchAsync(async (req, res, next) => {
    const user = await User.findOne({ emailAuthToken: req.params.token });

    if (!user) {
        return res.status(400).json({ error: 'this token is invalid' });
    }


    /* 
   *  
   *  Set expire time to the amount of time a token is valid. Azure will use a environment variable so changing "expireTime" wont affect the remote server.
   *  
   *  *NOTE* Azure will set the environment variable to 15 seconds regardless of what you set spamCooldown to.
   */
    expireTime = 86400000 //1 day in ms
    if (process.env.EMAIL_RESET_EXPIRE_TIME != undefined) {
        spamCooldown = process.env.EMAIL_RESET_EXPIRE_TIME
    }

    /*
    * If the token is expired, error.
    *
    */
    if (expireTime + user.emailAuthTokenCreation.getTime() < Date.now()) {
        res.status(410).json({ error: 'token expired' });
    }

    await user.updateOne({ emailAuthenticated: true });


    req.login(user, err => {
        if (err) {
            return res.status(500).json({ error: 'there has been an issue logging in to your account' })
        }
        res.status(200).json({ response: 'Accounted Authenticated and logged in', user: user })

    })

}));

/**
 * @swagger
 * /protected:
 *  get:
 *      description: Tests to see if you are logged in      
 *      tags:
 *        - UserAuthentication
 *        - Get
 *      responses:
 *          '200':
 *              description: you are logged in
 *          '401':
 *              description: you are not authenticated
 *          '500':
 *              description: you do not have access to this page
 *              
 */
userRouter.get('/protected', isLoggedIn, catchAsync(async (req, res, next) => {
    return res.json({ status: 'success' })
}));


/**
 * @swagger
 * /logout:
 *  post:
 *      description: Logs the user out.     
 *      tags:
 *        - UserAuthentication
 *        - Post
 *      responses:
 *          '200':
 *              description: you successfully logged out
 *          '401':
 *              description: you are not authenticated
 *          '500':
 *              description: an unexpected error has occured
 *              
 */
userRouter.post('/logout', isLoggedIn, (req, res) => {
    try {
        req.logout()
        return res.status(200).json({ error: '' })
    } catch (e) {
        throw new AppError(e, 500)
    }
})

//get your account info
/**
 * @swagger
 * /account:
 *  get:
 *      description: get your account info
 *      tags:
 *        - UserAuthentication
 *        - Get
 *      responses:
 *          '200':
 *              description: User info
 *          '401':
 *              description: you are not authenticated
 *          '500':
 *              description: an unexpected error occured
 *              
 */
userRouter.get('/account', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate('events').populate('friends')
    return res.status(200).json({ user })
}))

/**
 * @TODO Fix these before allows frontend to access them
 */

//delete your account
userRouter.delete('/account', isLoggedIn, catchAsync(async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id)
        return res.status(200).json({ error: '' })
    } catch (e) {
        return res.status(500).json({ error: 'user could not be deleted' })
    }
}))

//VERIFICATION NEEDS TO BE IMPLEMENTED WHEN U CHANGE YOUR EMAIL
//update your account

/**
 * 
 * 
 * @swagger
 * /account:
 *  put:
 *      description: update your account
 *      tags:
 *        - UserAuthentication
 *        - Put
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
 *              description: Updated Account
 *          '500':
 *              description: your phone number needs to be between 12 and 14 characters long
 *          '410':
 *              description: phone already taken
 *          '411':
 *              description: email already taken
 *          '412':
 *              description: username already taken
 *              
 */
userRouter.put('/account', isLoggedIn, catchAsync(async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const { firstName = user.firstName, lastName = user.lastName, username = user.username, phone = user.phone, email = user.email } = req.body;
        if (firstName == '' || lastName == '' || username == '' || phone == '' || email == '') { return res.status(500).json({ error: 'Fields required' }) }

        const usersWithThatUsername = await User.find({ username: username })
        if (usersWithThatUsername.length > 0 && (usersWithThatUsername.length > 1 || usersWithThatUsername[0]._id.toString() != req.user._id)) {
            return res.status(412).json({ error: 'username is taken' })
        }

        const usersWithThatEmail = await User.find({ email: email })
        if (usersWithThatEmail.length > 0 && (usersWithThatEmail.length > 1 || usersWithThatEmail[0]._id.toString() != req.user._id)) {
            return res.status(411).json({ error: 'email is taken' })
        }

        const usersWithThatPhone = await User.find({ phone: phone })
        if (usersWithThatPhone.length > 0 && (usersWithThatPhone.length > 1 || usersWithThatPhone[0]._id.toString() != req.user._id)) {
            return res.status(410).json({ error: 'phone is taken' })
        }

        /**
         * @TODO : verify new email
         * 
         * For now don't update email.
         */
        //await User.findByIdAndUpdate(req.user._id, { $set: { firstName: firstName, lastName: lastName, email: email, phone: phone, username: username } }, { new: true, runValidators: true });
        const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: { firstName: firstName, lastName: lastName, phone: phone, username: username } }, { new: true, runValidators: true });

        return res.status(200).json({ updatedUser })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ error: 'user could not be updated' })
    }
}))

//Gets the user's friends list 
/**
 * @swagger
 * /friends:
 *  get:
 *      description: Gets the user's friends list 
 *      tags:
 *        - Friends 
 *        - Get
 *      responses:
 *          '200':
 *              description: FriendList
 *          '401':
 *              description: you are not authenticated
 *          '500':
 *              description: unexepected error
 */
userRouter.get('/friends', isLoggedIn, catchAsync(async (req, res) => {

    try {
        const user = await User.findById(req.user._id).populate('friends')
        const friends = user.friends
        return res.status(200).json({ friends })
    } catch (e) {
        return res.status(500).json({ error: 'could not find friends' })
    }
}))

//view the details of a specific friend
/**
 * @swagger
 * /friends/{friendId}:
 *  get:
 *      description: view the details of a specific friend
 *      tags:
 *        - Friends 
 *        - Get
 *      parameters:
 *          -   in: path
 *              name: friendId
 *              schema:
 *                  type: string
 *                  example: 623018e31d596470d49769e0
 *              required: true
 *              description: "The ID of the userId whom is on our friends list and we are trying to "
 *              
 *      responses:
 *          '200':
 *              description: friend information.
 *          '500':
 *              description: something went wrong while looking for friend
 *          '401':
 *              description: you are not authenticated
 *          '404':
 *              description: no such user in your friends list
 *          '403':
 *              description: cannot add yourself to your friends list
 */
userRouter.get('/friends/:friendId', isLoggedIn, catchAsync(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends')
        const { friendId } = req.params

        if (friendId == req.user._id) {
            return res.status(403).json({ error: 'cannot view yourself in your friends list' })
        }

        for (let friend of user.friends) {
            if (friend._id.toString() == friendId) {
                return res.status(200).json({ friend })
            }
        }
        return res.status(404).json({ error: 'no such user in your friends list' })
    } catch (e) {
        return res.status(500).json({ error: 'something went wrong while looking for friend' })
    }
}))



/**
 * 
 * @swagger
 * /friends/{friendId}:
 *  post:
 *      description: add a new friend
 *      tags:
 *        - Friends
 *        - Post
 *      parameters:
 *          -   in: path
 *              name: friendId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "The userID of the friend you want to add, will look like:  http://primalparty.com/friend/[friendID]"
 * 
 *         
 *      responses:
 *          '200':
 *              description: new event
 *          '500':
 *              description: There is an unexepected issue creating this event
 *          '401':
 *              description: you are not authenticated
 *          '405':
 *              description: cannot add yourself to your friends list
 *          '409':
 *              description: this user is already in your friends list
 * 
 * 
 */
userRouter.post('/friends/:friendId', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate('friends')
    const { friendId } = req.params

    if (friendId == req.user._id) {
        return res.status(405).json({ error: 'cannot add yourself to your friends list' })
    }

    for (let friend of user.friends) {
        if (friend._id.toString() == friendId) {
            return res.status(409).json({ error: 'this user is already in your friends list' })
        }
    }

    const friend = await User.findById(friendId)
    await User.findByIdAndUpdate(user._id, { $addToSet: { friends: friend._id } }, { new: true, runValidators: true })
    await User.findByIdAndUpdate(friend._id, { $addToSet: { friends: user._id } }, { new: true, runValidators: true })
    return res.status(200).json({ error: '' })
}))

/**
 * 
 * @swagger
 * /friends/{friendId}:
 *  delete:
 *      description: delete user from your friend's list
 *      tags:
 *        - Friends
 *        - Delete
 *      parameters:
 *          -   in: path
 *              name: friendId
 *              schema:
 *                  type: string
 *                  example: 17de19ce2d431d191350cb31912dbf2796f84bb1
 *              required: true
 *              description: "The userID of the friend you want to delete, will look like:  http://primalparty.com/friend/[friendID]"
 * 
 *         
 *      responses:
 *          '200':
 *              description: new event
 *          '500':
 *              description: There is an unexepected issue creating this event
 *          '401':
 *              description: you are not authenticated
 *          '403':
 *              description: you don't have permision to do this 
 *          '400':
 *              description: cannot delete yourself from your friends list @TODO should be 403
 *          '404':
 *              description: this user is not in your friends list
 *              
 */
userRouter.delete('/friends/:friendId', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate('friends')
    const { friendId } = req.params

    if (friendId == req.user._id) {
        return res.status(400).json({ error: 'cannot delete yourself from your friends list' })
    }

    for (let friend of user.friends) {
        if (friend._id.toString() == friendId) {
            await User.findByIdAndUpdate(req.user._id, { $pull: { friends: friendId } }, { new: true, runValidators: true })
            await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user._id } }, { new: true, runValidators: true })
            return res.status(200).json({ error: '' })
        }
    }

    return res.status(404).json({ error: 'this user is not in your friends list' })

}))

//search users
/**
 * @swagger
 * /users:
 *  get:
 *      description: view user information from search
 *      tags:
 *        - Friends 
 *        - Get
 *      parameters:
 *          -   in: query
 *              name: q
 *              schema:
 *                  type: string
 *                  example: Emin
 *              description: "Searches for a matching: firstName, lastName, username, email, or phone"
 *              
 *      responses:
 *          '200':
 *              description: found users information.
 *          '500':
 *              description: something went wrong while looking for users
 *          '401':
 *              description: you are not authenticated
 */
userRouter.get('/users', isLoggedIn, catchAsync(async (req, res) => {
    const { q } = req.query
    console.log(req.query);
    await User.find({
        $and: [{ _id: { $ne: req.user._id } },
        {
            $or:
                [{ "firstName": { "$regex": `${q}`, "$options": "i" } },
                { "lastName": { "$regex": `${q}`, "$options": "i" } },
                { "username": { "$regex": `${q}`, "$options": "i" } },
                { "email": { "$regex": `${q}`, "$options": "i" } },
                { "phone": { "$regex": `${q}`, "$options": "i" } }           /**@TODO Remove this because phone numbers shouldn't be public.*/
                ]
        }]
    }, (error, docs) => {
        if (error) {
            return res.status(500).json({ error: 'search failed' })
        } else {
            return res.status(200).json({ users: docs, error: '' })
        }
    }).clone()
}))

/**
 * @TODO : Add reset passowrd (while logged in )
 */


module.exports = userRouter;