import express from "express";
const app = express();
import cors from "cors";
import cookieParser from cookie-parser;


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));
// in early express directly not parse a json data for that parsing middleware such as body-parser and multer use,but in modern express it's inbuilt

app.use(express.json(
    {
        limit: "16kb",
        
    }
))
app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"));
app.use(cookieParser());








export { app };
