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
        type: Date,
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
}, {timestamps:true})

//every time you run findByIdAndDelete on an instance of an event:

//remove all the tasks associated with the event
//remove this event from events list of all the users

EventSchema.post('findOneAndDelete', async function(event){
    const User = require('./user')
    const Task = require('./task')
    
    const {_id} = event;

    if(event.tasks){
        await Task.deleteMany({event: _id})
    }

    await User.updateMany({}, {$pull: {events: _id}});
})

module.exports = mongoose.model('Event', EventSchema)