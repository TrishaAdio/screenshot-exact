const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

// Resolve uploads directory at backend/uploads (sibling of this file's parent).
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Long random filename — unguessable, no original name leaked.
    const random = crypto.randomBytes(16).toString("hex");
    cb(null, `${random}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
    return cb(
      Object.assign(new Error("Only JPG, PNG and WEBP images are allowed"), {
        status: 400,
      })
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB
});

module.exports = { upload, uploadsDir };
