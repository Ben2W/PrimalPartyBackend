const eventRouter = require('express').Router();
const User = require('../models/user')
const Task = require('../models/task')
const Event = require('../models/event')




//YOUR ENDPOINTS GO HERE. ORDER OF ROUTES IN EXPRESS MATTERS!!!!!! 
//YOUR ROUTE MIGHT NOT WORK JUST BECAUSE IT IS NOT IN THE CORRECT PLACE IN THE FILE

//Deletes an event based on the event $oid
eventRouter.post('/DeleteEvent', async(req, res)=>{
   await Event.findOneAndDelete(req.body.eventID);
    /*const eventID = req.body.eventID;
    const query = await Event.findOneAndDelete({ $oid : eventID});

    if(!query.length){ 
        throw new Error('Event not found');
        return;
        }
    
    console.log(JSON.stringify(query));
    res.json(query);
    */
});


eventRouter.post('/CreateEvent', async(req, res)=>{
    const name = req.body.name;
    const description = req.body.description;
   // const tags = req.body.tags;
    const address = req.body.address;
    const date = req.body.date;
    const admin = req.body.admin;
    //const guests = req.body.guests;
    //const tasks = req.body.tasks;

    const newEvent = new Event({name : "POOP", description : "POOP", address : "POOP", date: "POOP"});
    newEvent.save();
    

    res.send()
})

module.exports = eventRouter;