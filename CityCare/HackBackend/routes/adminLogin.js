import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "sharad@1234";
const adminLoginRouter = Router();




//signup
adminLoginRouter.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {

    const hashedPass = await bcrypt.hash(password, 10);

    
    await pool.query(
      "INSERT INTO admin (name, email, phone, password_hash) VALUES ($1, $2, $3, $4)",
      [name, email, phone, hashedPass]
    );

    res.json({ message: "Admin registered successfully " });
  } catch (e) {
    console.error(e);
    if (e.code === "23505") {
      
      res.status(400).json({ message: "Email already exists ❌" });
    } else {
      res.status(500).json({ message: "Signup failed", error: e.message });
    }
  }
});




//signin
adminLoginRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admin WHERE email = $1", [email]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(400).json({ message: "Admin not found ❌" });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Incorrect password ❌" });
    }

    const admintoken = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("sessionadmintoken", admintoken, {
      httpOnly: true,
      secure: false, 
      maxAge: 60 * 60 * 60 * 1000,
    });

    res.json({ message: "Signin successful ✅" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Signin failed", error: e.message });
  }
});




export {adminLoginRouter};