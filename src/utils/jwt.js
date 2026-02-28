import mainconfig from '../config/index.js';
import jwt from "jsonwebtoken";

function createJWT(data) {
    const token = jwt.sign(data, mainconfig.jwtSecret,{
        expiresIn: "365d",
    });
    return token;

}

async function verifyJWT(authtoken) {
return new Promise((resolve, reject) => {
    jwt.verify(authtoken, mainconfig.jwtSecret,(err, data) => {
        if(err){
           return reject(err);
        }
        return resolve(data);
    })
    });

}

export  { createJWT, verifyJWT };