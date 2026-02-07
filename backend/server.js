import 'dotenv/config'; 
import app from "./src/app.js";
import mongoose from "mongoose";

app.listen(process.env.PORT,"0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));