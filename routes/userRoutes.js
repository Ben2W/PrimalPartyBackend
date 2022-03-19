const userRouter = require('express').Router();
const User = require('../models/user')
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn} = require('../middleware.js')
const AppError =  require('../utils/AppError')


 userRouter.post('/register', catchAsync(async(req, res, next) => {
    try {
        
        const {password, ...rest} = req.body
        const user = new User(rest);
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return res.status(500).json({error: 'there has been an issue creating an account'})
            }
            res.status(200).json({error:''})
            
        })
    } catch (e) {
        return res.status(500).json({error: 'there has been an issue creating an account'})
    }
 }))

userRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {
    if (err) { res.json({error:'error happened when logging in'}) }
    if (!user) { res.json({error:'error happened when logging in'}) }
    req.logIn(user, function(err) {
      if (err) { res.json({error:'login failed'}) }
      res.json({error:''})
    });
  })(req, res, next);
});




userRouter.get('/protected', isLoggedIn,  catchAsync(async(req, res, next) => {
    res.json({ status: 'success' })

})); 

userRouter.post('/logout', isLoggedIn, (req,res)=>{
    try{
        req.logout()
        res.status(200).json({error:''})
    }catch(e){
        throw new AppError(e,500)
    }
})

module.exports = userRouter;