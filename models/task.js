const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TaskSchema = new Schema({
    event:{
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    name:{
        type:String,
        required:true,
        maxlength: 30
    },
    description:{
        type:String,
        maxlength: 100
    },
    assignees: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        validate: v => Array.isArray(v) && v.length > 0 //to make sure at least one person is assigned the task
    },
    done:{
        type:Boolean,
        required:true
    }
})

module.exports = mongoose.model('Task', TaskSchema);