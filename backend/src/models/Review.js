import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  code: String,
  language: String,
  summary: String,
  modelUsed: String,
  issues: Array,
  fixedCode: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Review", ReviewSchema);