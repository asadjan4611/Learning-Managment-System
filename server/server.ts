import { app } from "./app";
import dotenv from "dotenv"
import connectDB from "./utilis/db"

dotenv.config();
// create our server

app.listen(8000 ,()=>{
    console.log("Server is connected with PORT",process.env.PORT);
    connectDB();
})