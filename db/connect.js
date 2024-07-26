import mongoose from "mongoose"

const ConnectDB = async ()=>{
    try{
     const conn = await mongoose.connect(process.env.MONGODB_URI)
         console.log(`MongoDb connected ${conn.connection.host}`)
    }catch(error){
       console.error(`Error message ${error.message}`)
       process.exit(1);
    }
}

export default ConnectDB;