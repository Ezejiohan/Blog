const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ezejiohan:Passenger24@cluster0.ffh3iwb.mongodb.net/').then(() => {
    console.log('connect to MongoDB successfully')
}).catch((err) => {
    console.log('err.message')
});