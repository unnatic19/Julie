/***************************
 * server.js
 ***************************/
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

// For file uploads
const multer = require("multer");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs"); // fs already used later; keep single require

// remove.bg for background removal
const { removeBackgroundFromImageFile } = require("remove.bg");

// ====== CONFIGURE THIS ======
const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY || "YOUR_REMOVE_BG_API_KEY";
// ============================

// Express app setup
const app = express();
const port = process.env.PORT || 5001;

// CORS
app.use(
  cors({
    origin: [
      // Add all the ports from which your front-end might connect
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// handle CORS pre‑flight requests globally
app.options("*", cors());

app.use(bodyParser.json());

// PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "Wardrobe",
  password: process.env.DB_PASSWORD || "YOUR_DB_PASSWORD",
  port: process.env.DB_PORT || 5432,
});

// Setup a static folder to serve images (optional)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/processed", express.static(path.join(__dirname, "processed")));

// Basic test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// ============== AUTH ROUTES ==============

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Signup successful",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// alias for front‑end route
app.post("/auth/signup", async (req, res) => {
  // Re‑use the same logic as /signup
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    res.status(201).json({
      message: "Signup successful",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Signup Error (/auth):", err.message);
    res.status(500).send("Server Error");
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// ========== CREATE OR UPDATE PROFILE ==========
app.post("/profile", async (req, res) => {
  try {
    const { userId, height, chest, weight, waist, gender, age, photoURL } = req.body; // keep photoURL name from front-end

    const existingProfile = await pool.query(
      "SELECT * FROM profile WHERE user_id = $1",
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      // Update existing profile
      await pool.query(
        `UPDATE profile 
         SET height = $1, chest = $2, weight = $3, waist = $4, user_photo = $5, gender = $6, age = $7
         WHERE user_id = $8`,
        [height, chest, weight, waist, photoURL, gender, age, userId]
      );
      res.json({ message: "Profile updated" });
    } else {
      // Insert new profile
      await pool.query(
        `INSERT INTO profile (
          user_id, user_photo, height, chest, weight, waist, gender, age
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, photoURL, height, chest, weight, waist, gender, age]
      );
      res.json({ message: "Profile created" });
    }
  } catch (err) {
    console.error("Profile Error:", err.message);
    res.status(500).send("Server Error");
  }
});

// ========== READ PROFILE ==========
app.get("/profile", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "userId query param required" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT user_photo,
              height,
              chest,
              weight,
              waist,
              gender,
              age,
              season,
              undertone,
              palette
       FROM profile
       WHERE user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(rows[0]); // returns single profile row
  } catch (err) {
    console.error("Profile GET error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ========== GENERATE COLOUR ANALYSIS ==========
app.post("/profile/colour", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  try {
    // fetch profile row
    const { rows } = await pool.query(
      `SELECT user_photo, height, chest, weight, waist, gender, age
       FROM profile
       WHERE user_id = $1`,
      [userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Profile not found" });

    const profile = rows[0];

    // build multipart form-data for Python service
    const form = new FormData();
    form.append("profile", JSON.stringify(profile));
    const fileName = path.basename(profile.user_photo); // strip any URL parts
    const photoPath = path.join(__dirname, "uploads", fileName);
    console.log("⤷ colour route will read:", photoPath);
    if (!fs.existsSync(photoPath)) {
      console.error("Photo not found:", photoPath);
      return res.status(500).json({ message: "Photo file missing on server" });
    }
    form.append("photo", fs.createReadStream(photoPath));

    const aiRes = await fetch("http://127.0.0.1:8001/analyze", {
      method: "POST",
      body: form,
    });
    const data = await aiRes.json();

    if (!aiRes.ok) {
      console.error("Colour‑service error:", data);
      // Provide fallback default values
      const fallbackData = {
        season: "Spring",
        undertone: "Warm",
        palette: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"]
      };
      
      // save fallback result to DB
      await pool.query(
        `UPDATE profile
           SET season     = $1,
               undertone  = $2,
               palette    = $3::jsonb
         WHERE user_id    = $4`,
        [fallbackData.season, fallbackData.undertone, JSON.stringify(fallbackData.palette), userId]
      );
      
      return res.json(fallbackData);
    }

    // Handle case where analysis returns unknown values
    if (data.season === 'unknown' || data.undertone === 'unknown' || !data.palette || data.palette.length === 0) {
      const fallbackData = {
        season: "Spring",
        undertone: "Warm", 
        palette: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"]
      };
      
      // save fallback result to DB
      await pool.query(
        `UPDATE profile
           SET season     = $1,
               undertone  = $2,
               palette    = $3::jsonb
         WHERE user_id    = $4`,
        [fallbackData.season, fallbackData.undertone, JSON.stringify(fallbackData.palette), userId]
      );
      
      return res.json(fallbackData);
    }

    // save result back to DB
    await pool.query(
      `UPDATE profile
         SET season     = $1,
             undertone  = $2,
             palette    = $3::jsonb
       WHERE user_id    = $4`,
      [data.season, data.undertone, JSON.stringify(data.palette), userId]
    );

    res.json(data); // send season / palette to front‑end
  } catch (err) {
    console.error("Profile colour route error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// ============ MULTER SETUP ============

// Create 'uploads' and 'processed' folders if they don't exist
// (Optional: you can do this manually or via Node's fs)
const uploadsPath = path.join(__dirname, "uploads");
const processedPath = path.join(__dirname, "processed");
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath);
if (!fs.existsSync(processedPath)) fs.mkdirSync(processedPath);

// Configure Multer to store the files on disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // or path.join(__dirname, "uploads")
  },
  filename: function (req, file, cb) {
    // e.g., myfile-1634839203948.png
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

// ── POST /profile/photo ────────────────────────────
//   Expects field name "photo" from front‑end.
//   Returns { filePath: "uploads/filename.ext" }
app.post("/profile/photo", upload.single("photo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const filePath = req.file.path.replace(/\\/g, "/"); // Windows safety
    return res.json({ filePath });
  } catch (err) {
    console.error("Photo upload error:", err.message);
    return res.status(500).send("Server Error");
  }
});

// ========== CREATE WARDROBE ITEM ==========
// Use the Multer middleware to handle the 'image' field
app.post("/wardrobe", upload.single("image"), async (req, res) => {
  try {
    // We'll get all the fields from the form:
    const {
      userId,
      brand,
      clothingType,
      size,
      color,
      season,
      description,
    } = req.body;

    // The uploaded file info:
    const originalFilePath = req.file.path; // e.g. "uploads/image-12345.png"

    // We want to remove the background using remove.bg
    // We'll create a destination for the processed image
    const processedFileName = "bg-removed-" + Date.now() + ".png";
    const processedFilePath = path.join(processedPath, processedFileName);

    // removeBackgroundFromImageFile
    const removeBgOptions = {
      path: originalFilePath,
      apiKey: REMOVE_BG_API_KEY,
      size: "auto",
      type: "auto",
      scale: "100%",
      outputFile: processedFilePath,
      format: "png",
    };

    await removeBackgroundFromImageFile(removeBgOptions);

    // Insert into DB
    const dbResult = await pool.query(
      `INSERT INTO wardrobe_items (
        user_id, 
        original_image_path, 
        processed_image_path, 
        brand,
        clothing_type,
        size,
        color,
        season,
        description
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        userId,
        originalFilePath,
        processedFilePath,
        brand,
        clothingType,
        size,
        color,
        season,
        description,
      ]
    );

    res.status(201).json({
      message: "Wardrobe item added successfully with background removed.",
      item: dbResult.rows[0],
    });
  } catch (err) {
    console.error("Error adding wardrobe item:", err.message);
    res.status(500).send("Server Error");
  }
});

// ========== GET WARDROBE ITEMS FOR USER (query param) ==========
app.get("/wardrobe_items", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: "userId query param required" });
  }
  try {
    const result = await pool.query(
      "SELECT * FROM public.wardrobe_items WHERE user_id = $1 ORDER BY item_id ASC",
      [userId]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching wardrobe_items:", err.message);
    return res.status(500).json({ message: "Server Error" });
  }
});

// ========== GET WARDROBE ITEMS FOR USER ==========
app.get("/wardrobe/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      "SELECT * FROM wardrobe_items WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching wardrobe items:", err.message);
    res.status(500).send("Server Error");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}).on('error', (err) => {
  console.error(`Failed to start server on port ${port}:`, err.message);
});