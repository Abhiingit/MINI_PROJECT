require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors({
  origin: "https://atttendance-saas.netlify.app",
  credentials: true
}));
app.use(express.json());

app.use("/api/auth",require("./routes/authRoutes"));

app.use("/api/attendance",require("./routes/attendanceRoutes"));

app.use("/api/leave",require("./routes/leaveRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.listen(process.env.PORT,()=>{

 console.log("Server running");

});
