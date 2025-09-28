import mongoose from "mongoose";

function connect(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(function(){
        console.log("connected to MongoDB");
    })
    .catch(err => {
        console.log(err);
    })
}

export default connect