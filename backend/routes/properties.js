const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const propertyController = require("../controllers/propertyController");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", propertyController.getAllProperties);
router.get("/my", authMiddleware, propertyController.getMyProperties);
router.get("/:id", propertyController.getPropertyById);
router.post("/", authMiddleware, upload.array("images", 10), propertyController.addProperty);
router.put("/:id", authMiddleware, upload.array("images", 10), propertyController.updateProperty);
router.delete("/:id", authMiddleware, propertyController.deleteProperty);

module.exports = router;