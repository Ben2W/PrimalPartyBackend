const errorRouter = require('express').Router();
const AppError = require('../utils/AppError');


errorRouter.all('*', (req, res, next) => {
    next(new AppError('API endpoint is non-existent', 404))
})

errorRouter.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).json({'error' : err })
})


module.exports = errorRouter;