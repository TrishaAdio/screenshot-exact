const express = require("express");
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/adminController");
const products = require("../controllers/productController");
const notices = require("../controllers/noticeController");
const uploadCtrl = require("../controllers/uploadController");
const requireAdmin = require("../middleware/adminAuth");
const { upload } = require("../middleware/upload");

const router = express.Router();

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, try again later." },
});

router.post("/login", adminLoginLimiter, ctrl.login);
router.get("/me", requireAdmin, ctrl.me);
router.get("/stats/today", requireAdmin, ctrl.statsToday);
router.get("/stats/weekly", requireAdmin, ctrl.statsWeekly);
router.get("/users/emails", requireAdmin, ctrl.allUserEmails);
router.post("/send-email", requireAdmin, ctrl.sendEmail);

// Product management — admin only.
router.post("/products", requireAdmin, products.create);
router.delete("/products/:id", requireAdmin, products.remove);

// Global notices — admin CRUD.
router.get("/notices", requireAdmin, notices.listAll);
router.post("/notices", requireAdmin, notices.create);
router.patch("/notices/:id", requireAdmin, notices.update);
router.delete("/notices/:id", requireAdmin, notices.remove);

// Image upload — admin only. Field name: "image". Max 2MB. JPG/PNG/WEBP.
router.post(
  "/upload",
  requireAdmin,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (!err) return next();
      const status = err.status || (err.code === "LIMIT_FILE_SIZE" ? 413 : 400);
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 2MB or smaller"
          : err.message || "Upload failed";
      return res.status(status).json({ success: false, message });
    });
  },
  uploadCtrl.uploadImage
);

module.exports = router;
