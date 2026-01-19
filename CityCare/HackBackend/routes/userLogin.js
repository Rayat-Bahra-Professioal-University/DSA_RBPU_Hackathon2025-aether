import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "sharad@1234";
const userLoginRouter = Router();


// signup
userLoginRouter.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const hashedPass = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4)",
      [name, email, phone, hashedPass]
    );

    res.json({ message: "User registered successfully ✅" });
  } catch (e) {
    console.error(e);
    if (e.code === "23505") {
      res.status(400).json({ message: "Email already exists ❌" });
    } else {
      res.status(500).json({ message: "Signup failed", error: e.message });
    }
  }
});


// signin
userLoginRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Incorrect password ❌" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.cookie("sessiontoken", token, {
      httpOnly: true,
      secure: false, // set true if using HTTPS
      maxAge: 60 * 60 * 60 * 1000,
    });

    res.json({ message: "Signin successful ✅" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Signin failed", error: e.message });
  }
});


export { userLoginRouter };
