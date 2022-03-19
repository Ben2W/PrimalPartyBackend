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







//   userRouter.get('/', (req, res, next) => {
//     res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>');
// });

// // When you visit http://localhost:3000/login, you will see "Login Page"
// userRouter.get('/login', (req, res, next) => {
   
//     const form = '<h1>Login Page</h1><form method="POST" action="/login">\
//     Enter Username:<br><input type="text" name="username">\
//     <br>Enter Password:<br><input type="password" name="password">\
//     <br><br><input type="submit" value="Submit"></form>';

//     res.send(form);

// });

// // When you visit http://localhost:3000/register, you will see "Register Page"
// userRouter.get('/register', (req, res, next) => {

//     const form = '<h1>Register Page</h1><form method="post" action="register">\
//                     Enter Username:<br><input type="text" name="username">\
//                     <br>Enter Password:<br><input type="password" name="password">\
//                     <br><br><input type="submit" value="Submit"></form>';

//     res.send(form);
    
// });

// /**
//  * Lookup how to authenticate users on routes with Local Strategy
//  * Google Search: "How to use Express Passport Local Strategy"
//  * 
//  * Also, look up what behaviour express session has without a maxage set
//  */
//  userRouter.get('/protected-route', (req, res, next) => {
    
//     // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
//     if (req.isAuthenticated()) {
//         res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
//     } else {
//         res.send('<h1>You are not authenticated</h1><p><a href="/login">Login</a></p>');
//     }
// });

// // Visiting this route logs the user out
// userRouter.get('/logout', (req, res, next) => {
//     req.logout();
//     res.redirect('/protected-route');
// });

// userRouter.get('/login-success', (req, res, next) => {
//     res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
// });

// userRouter.get('/login-failure', (req, res, next) => {
//     res.send('You entered the wrong password.');
// });