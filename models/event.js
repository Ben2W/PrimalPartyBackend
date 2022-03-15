const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = require('./user')
const Task = require('./task')

const EventSchema = new Schema({
    name:{
        type:String,
        required:true,
        maxlength: 50
    },
    description:{
        type:String,
        maxlength: 350
    },
    tags:[String],
    address: {
        type:String,
        required:true
    },
    date: {
        type:String,
        required:true
    },
    admin:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    guests:[
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    tasks:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        }
    ]
})

//every time u run findByIdAndDelete on an instance of an event,
//remove all the tasks associated with the events
//remove this event from events of the user

EventSchema.post('findOneAndDelete', async function(event){
    const {_id} = event

    if(event.tasks){
        await Task.findByIdAndDelete({event: _id})
    }

    await User.updateMany({}, {$pull: {event: _id}})
})

module.exports = mongoose.model('Event', EventSchema)