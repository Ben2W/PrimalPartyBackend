const userRouter = require('express').Router();
const passport = require('passport');
const User = require('../models/user')

const {isLoggedIn} = require('../middleware')
const catchAsync = require('../utils/catchAsync');




/**
 * -------------- POST ROUTES ----------------
 */

 // TODO
 userRouter.post('/login', passport.authenticate('local'), (req, res, next) => {



 });

 // TODO
 userRouter.post('/register', catchAsync(async(req, res, next) => {

    try {
        
        const {password} = req.body
        const user = new User(req.body);
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.send('yay')
            
        })
    } catch (e) {
        res.send(e)
    }
 }));

 userRouter.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    res.send('authenticated')
})



 /**
 * -------------- GET ROUTES ----------------
 */


userRouter.get('/protected', isLoggedIn, (req,res)=>{
    console.log(req.user)
    res.send("This is a protected route, if u made it here means u r logged in")
})

userRouter.get('/logout', (req,res)=>{
    req.logout()
    res.send("bye bye")
})


module.exports = userRouter;