import {Redis} from 'ioredis'
require('dotenv').confog();



const radisClient =()=>{
    if (process.env.REDIS_URL) {
        console.log("Radis connected");
        return process.env.REDIS_URL;
    }
    throw new Error("Radis connection failed")

}

export const radis = new Redis(radisClient());