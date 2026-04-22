const express         = require("express");
const router          = express.Router();
const auth            = require("../middleware/authMiddleware");
const leaveController = require("../controllers/leaveController");

router.post("/apply",  auth, leaveController.applyLeave);
router.get("/my",      auth, leaveController.getMyLeaves);   // NEW

module.exports = router;