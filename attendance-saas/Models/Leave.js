const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    userId:    { type: String, required: true },
    companyId: { type: String },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    reason:    { type: String, required: true },
    status:    { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);