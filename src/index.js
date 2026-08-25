// require('dotenv').config({ path:'./view'})
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
import dotenv from "dotenv";
// import "dotenv/config";
import express from "express";
import connectDB from "./db/index.js";
const app = express();

dotenv.config({
    path:"./env"
})


connectDB().then(
  () => {
    app.listen(process.env.PORT ||8000, () => {
      console.log(`APP CREATED SUCCESSFULLY.AT ${process.env.PORT}`)
    })
  }
).catch((err) => {
  console.log("MONGO DB CONNECTION FAILED !!!",err);
})

/**
 (async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", () => {
      console.log("ERRROR ", (err) => {
        console.log("ERR", err);
        throw error;
      });
    });
      app.listen(process.env.PORT, () => {
          console.log(`App is listening on port ${process.env.PORT}`)
      })
  } catch (err) {
    console.log("ERROR :", err);
    throw err;
  }
})();

 */
