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
        required:true
    },
    phone:{
        type:String,
        required:true,
        minlength:[12, "phone number has to be 12 characters long"], // +14077574245
        maxlength:[12, "phone number has to be 12 characters long"]
    },
    email:{
        type:String,
        required:true
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
    resetToken:[
        {
            data: String,
            default: ''
        }
    ],

}, {timestamps:true})


UserSchema.plugin(passportLocalMongoose);

//every time u run findByIdAndDelete on an instance of a user:
//check if that user is admin for some event and if yes, then delete that event

UserSchema.post('findOneAndDelete', async function(user){
    const {_id} = user

    if (user.events){
        await Event.deleteMany({admin:_id})
    }

    await Task.updateMany({}, {$pull: {assignees: _id}})
})

module.exports = mongoose.model('User', UserSchema);
