const Attendance = require("../Models/Attendance");

exports.checkIn = async (req, res) => {
  try {
    // Prevent duplicate check-in on same day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: startOfDay },
    });
    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const attendance = await Attendance.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      checkInTime: new Date(),
      status: "Present",
    });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Check-in failed" });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const record = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: startOfDay },
      checkOutTime: null,
    });
    if (!record) {
      return res.status(400).json({ message: "No active check-in found" });
    }
    record.checkOutTime = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Check-out failed" });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance" });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching student attendance" });
  }
};

// ADMIN: get all attendance records for the company
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ companyId: req.user.companyId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all attendance" });
  }
};