import mongoose from "mongoose";
import { MONGODB_URI } from "../configs";

export const connectDB = async () =>{
    try{
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDb connected successfully");
        //can use mongodb after this
        
    }
    catch(e){

        console.error("mongodb error",e);
        process.exit(1);
    }
}

export const connectDatabaseTest = async (uri: string) => {
    try {
        await mongoose.connect(uri);
    } catch (e) {
        console.error("Test mongodb error", e);
        throw e;
    }
}