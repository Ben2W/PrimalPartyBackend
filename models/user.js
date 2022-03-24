const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const Event = require('./event')
const Task = require('./task')

const UserSchema = new Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName: {
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
        minlength:[12, "phone number has to be at least 12 characters long"], // +14077574245
        maxlength:[14, "phone number has to be at most 14 characters long"]
    },
    email:{
        type:String,
        required:true,
    },
    emailAuthenticated:{
        type:Boolean,
        default: false
    },
    emailAuthToken:{
        data: String,
        default: ''
    },
    emailAuthTokenCreation:{
        type: Date,
        default: Date.now
    },
    resetToken:{
        data: String,
        default: ''
    },
    resetTokenCreation:{
        type: Date,
        default: Date.now
    },
    friends:[
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    pendingRequests:[
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    events:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Event'
        }
    ],
    

}, {timestamps:true})


UserSchema.plugin(passportLocalMongoose, {


  
    //Usernames must be unique, but we define this in the schema so there is no reason to make another unneccesary query.
    usernameUnique: false,

  findByUsername: function(model, queryParameters) {
    // Add additional query parameter - AND condition - active: true
    queryParameters.emailAuthenticated = true;
    return model.findOne(queryParameters);
  }

});

//every time u run findByIdAndDelete on an instance of a user:
//check if that user is admin for some event and if yes, then delete that event
//if this user was assigned a task remove him from the assignees list

UserSchema.post('findOneAndDelete', async function(user){
    const {_id} = user

    if (user.events){
        await Event.deleteMany({admin:_id})
    }

    await Task.updateMany({}, {$pull: {assignees: _id}})
})

module.exports = mongoose.model('User', UserSchema);
