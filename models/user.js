const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
    login:{
        type:String,
        required:true
    },
    password:{
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
    events:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Event'
        }
    ]
})

//every time u run findByIdAndDelete on an instance of a user,
//check if that user is admin for some event and if yes, then delete that event
//also remove this person from friends list of other users
//also remove this person from assignees list of tasks

UserSchema.post('findOneAndDelete', async function(user){
    const {_id} = user

    if (user.events){
        await Event.findOneAndDelete({admin:_id})
    }

    //do this on the backend side, because you cannot use model before instantiating it

    // if (user.friends){
    //     await User.updateMany({}, { $pullAll: { friends: [_id]} })
    // }

    await Task.updateMany({}, {$pull: {assignees: _id}})
})

module.exports = mongoose.model('User', UserSchema);

