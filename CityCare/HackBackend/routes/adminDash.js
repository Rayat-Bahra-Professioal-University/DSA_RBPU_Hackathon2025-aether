import { Router } from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const adminDashRouter = Router();
const JWT_SECRET = "sharad@1234";




const authenticateAdmin = (req, res, next) => {
  const admintoken = req.cookies.sessionadmintoken;
  console.log(req.cookies);
  
  console.log(`token  ${admintoken}`);
  
  if (!admintoken) return res.status(401).json({ message: "Not authenticated ❌" });
  console.log("middleware started");
  
  try {
    const payload = jwt.verify(admintoken, JWT_SECRET);
    console.log("aaaaaaaaaaaaa");
    
        req.adminId = payload.id; // attach adminId to request

    console.log(`payload id ${payload.id}`);
    
    next();
  } catch (err) {
    console.log("catcchhhh");
    
    return res.status(401).json({ message: "Invalid token ❌" });
  }
};



adminDashRouter.get("/reports", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reports ❌", error: err.message });
  }
});


adminDashRouter.patch("/reports/:id/status", authenticateAdmin, async (req, res) => {
  const reportId = req.params.id;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required ❌" });

  try {
    const result = await pool.query(
      "UPDATE reports SET status = $1 WHERE id = $2 RETURNING *",
      [status, reportId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Report not found ❌" });

    res.json({ message: "Report status updated ✅", report: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status ❌", error: err.message });
  }
});




adminDashRouter.get("/profile", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, created_at FROM admin WHERE id = $1",
      [req.adminId]
    );
    // console.log(`ressssss   ${req.adminId}`);
    
    console.log("xxxx",result.rows[0].name); 
    res.json(result.rows[0]);  
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile ❌", error: err.message });
  }
});


adminDashRouter.post("/logout", authenticateAdmin, (req, res) => {
  res.clearCookie("sessionadmintoken");
  res.json({ message: "Logged out ✅" });
}); 

export { adminDashRouter };
