const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const attendanceController = require("../controllers/attendanceController");

router.post("/checkin",auth,attendanceController.checkIn);

router.post("/checkout",auth,attendanceController.checkOut);

router.get("/my-attendance", auth, attendanceController.getMyAttendance);

router.get("/student/:studentId", auth, attendanceController.getStudentAttendance);

module.exports = router;