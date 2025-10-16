import express from "express";
import cors from "cors";
import { adminLoginRouter } from "./routes/adminLogin.js";
import { userLoginRouter } from "./routes/userLogin.js";
import { userDashRouter } from "./routes/userDash.js";
import { adminDashRouter } from "./routes/adminDash.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());

app.use(express.json({limit:'20mb'}));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: 'http://localhost:3000', // your Next.js app URL
  credentials: true
}));
app.use(express.json());


app.use("/adminLogin",adminLoginRouter);
app.use("/userLogin",userLoginRouter); 
app.use("/admindash",adminDashRouter);
app.use("/userdash",userDashRouter);





app.listen(3001);