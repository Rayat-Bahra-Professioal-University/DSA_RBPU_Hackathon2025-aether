

import { Router } from "express";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";
import cloudinary from "../cloudinary.js";
const userDashRouter = Router();
const JWT_SECRET = "sharad@1234";


const authenticateUser = (req, res, next) => {
  const token = req.cookies.sessiontoken;
  if (!token) return res.status(401).json({ message: "Not authenticated ❌" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id; // attach userId to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token ❌" });
  }
};







userDashRouter.post("/reports", authenticateUser, async (req, res) => {
  const { title, description, priority, longitude, latitude, address, image } = req.body;

  if (!title || !longitude || !latitude)
    return res.status(400).json({ message: "Missing required fields ❌" });

  try {
    let image_url = null;
    let image_public_id = null;

   
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "citycare_reports",
      });

      image_url = uploadResult.secure_url;
      image_public_id = uploadResult.public_id;
    }

    
    const query = `
      INSERT INTO reports 
      (reporter_id, title, description, priority, location, address, image_url, image_public_id) 
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, $9)
      RETURNING *`;

    const values = [
      req.userId,
      title,
      description,
      priority,
      longitude,
      latitude,
      address,
      image_url,
      image_public_id
    ];

    const result = await pool.query(query, values);

    res.json({ message: "Report created ✅", report: result.rows[0] });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ message: "Failed to create report ❌", error: err.message });
  }
});



///////////////

userDashRouter.get("/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Convert PostGIS point into separate latitude/longitude
    const query = `
      SELECT 
        id,
        reporter_id,
        title,
        description,
        status,
        priority,
        address,
        created_at,
        image_url,
        image_public_id,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude
      FROM reports
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});






userDashRouter.get("/reports", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reports ❌", error: err.message });
  }
});









userDashRouter.get("/my-reports", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reports WHERE reporter_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your reports ❌", error: err.message });
  }
});









userDashRouter.get("/profile", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, created_at FROM users WHERE id = $1", [req.userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile ❌", error: err.message });
  }

});









// 5️⃣ Logout
userDashRouter.post("/logout", authenticateUser, (req, res) => {
  res.clearCookie("sessiontoken");
  res.json({ message: "Logged out ✅" });
});

export { userDashRouter };
