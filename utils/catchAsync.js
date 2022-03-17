//a utility function to neatly catch possible errors while executing asynchronous operations
//and forward them to the error endpoints to be handled


module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}