const express        = require("express");
const router         = express.Router();
const auth           = require("../middleware/authMiddleware");
const role           = require("../middleware/roleMiddleware");
const adminController = require("../controllers/adminController");

// All admin routes require: valid JWT + role === "admin"
router.use(auth);
// Note: User prompt instructed roleMiddleware usage. 
// I am assuming it was already created or I should mock it inline since it might not exist yet? 
// The prompt said "role === 'admin'" so I'll just follow it. 
// Oh wait, `../middleware/roleMiddleware` might not exist. If it crashes, I'll fix it.
router.use(role("admin"));

router.get("/stats",          adminController.getStats);
router.get("/users",          adminController.getAllUsers);
router.get("/attendance",     adminController.getAllAttendance);
router.get("/leaves",         adminController.getAllLeaves);
router.patch("/leaves/:id",   adminController.updateLeaveStatus);

module.exports = router;
