import cors from "cors";
import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import morgan from "morgan";
import router from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Add other headers as needed
  })
); // Enable CORS for all routes

//database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running..." });
});

// http:localhost:3000/api/v1/...
app.use("/api/v1", router);

// error not found
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

//listening on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
