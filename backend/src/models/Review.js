import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  code: String,
  language: String,
  summary: String,
  modelUsed: String,
  issues: Array,
  fixedCode: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Review", ReviewSchema);