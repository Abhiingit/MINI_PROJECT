const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId:       { type: String, required: true },
  companyId:    { type: String },
  date:         { type: Date, default: Date.now },
  checkInTime:  { type: Date },
  checkOutTime: { type: Date, default: null },
  status:       { type: String, enum: ["Present", "Absent", "Leave"], default: "Present" },
});

module.exports = mongoose.model("Attendance", attendanceSchema);