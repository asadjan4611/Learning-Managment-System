import { app } from "./app";
import dotenv from "dotenv"
import {v2 as cloudinary} from "cloudinary"
import connectDB from "./utilis/db"

dotenv.config();
//config  the cloudinary 
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_SECRET_KEY
});


// create our server

const port = parseInt(process.env.PORT || "8000", 10);

app.listen(port ,()=>{
    console.log("Server is connected with PORT", port);
    connectDB();
})