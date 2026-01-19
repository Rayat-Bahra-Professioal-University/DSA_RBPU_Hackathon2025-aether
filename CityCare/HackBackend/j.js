import { pool } from "./db.js";

import dotenv from "dotenv";

dotenv.config();

(async () => {
  const result = await pool.query("SELECT NOW()");
  console.log("Connected successfully ✅", result.rows);
})();
