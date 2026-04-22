const User       = require("../Models/User");
const Attendance = require("../Models/Attendance");
const Leave      = require("../Models/Leave");

// GET /api/admin/users
// Returns all users in the same company
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.companyId }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// GET /api/admin/attendance
// Returns all attendance records for the company, with user name populated
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ companyId: req.user.companyId })
      .sort({ date: -1 })
      .lean();

    // Attach user names manually (no populate since userId is String not ObjectId)
    const users = await User.find({ companyId: req.user.companyId }).select("_id name email").lean();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const enriched = records.map(r => ({
      ...r,
      userName:  userMap[r.userId]?.name  || "Unknown",
      userEmail: userMap[r.userId]?.email || "",
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance" });
  }
};

// GET /api/admin/leaves
// Returns all leave applications for the company, with user name
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .lean();

    const users = await User.find({ companyId: req.user.companyId }).select("_id name email").lean();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const enriched = leaves.map(l => ({
      ...l,
      userName:  userMap[l.userId]?.name  || "Unknown",
      userEmail: userMap[l.userId]?.email || "",
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

// PATCH /api/admin/leaves/:id
// Approve or reject a leave application
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: "Error updating leave" });
  }
};

// GET /api/admin/stats
// Summary numbers for the admin dashboard overview
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalAttendance, pendingLeaves, approvedLeaves] = await Promise.all([
      User.countDocuments({ companyId: req.user.companyId }),
      Attendance.countDocuments({ companyId: req.user.companyId }),
      Leave.countDocuments({ companyId: req.user.companyId, status: "pending" }),
      Leave.countDocuments({ companyId: req.user.companyId, status: "approved" }),
    ]);

    // Today's check-ins
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayPresent = await Attendance.countDocuments({
      companyId: req.user.companyId,
      date: { $gte: startOfDay },
      status: "Present",
    });

    res.json({ totalUsers, totalAttendance, pendingLeaves, approvedLeaves, todayPresent });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};
