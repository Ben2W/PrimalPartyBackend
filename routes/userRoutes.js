const userRouter = require('express').Router();
const User = require('../models/user')
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn} = require('../middleware.js')
const AppError =  require('../utils/AppError')


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
        
        const {password, ...rest} = req.body
        const user = new User(rest);
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return res.status(500).json({error: 'there has been an issue creating an account'})
            }
            return res.status(200).json({error:''})
            
        })
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