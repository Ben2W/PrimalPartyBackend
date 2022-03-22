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
    assignees: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    done:{
        type:Boolean,
        required:true
    }
}, {timestamps:true})

module.exports = mongoose.model('Task', TaskSchema);