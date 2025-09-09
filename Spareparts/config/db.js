const mongoose=require('mongoose');
require('dotenv').config();

mongoose.connect("")
.then(()=>{
    console.log("Connected to mongo DB");
}).catch((err)=>{
    console.log(err);
})
