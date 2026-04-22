const Leave = require("../Models/Leave");

exports.applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const leave = await Leave.create({
      userId:    req.user.id,
      companyId: req.user.companyId,
      startDate,
      endDate,
      reason,
    });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: "Failed to apply leave" });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaves" });
  }
};
