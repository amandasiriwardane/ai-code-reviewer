import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: function() { return !this.googleId; } // Only required for manual signup
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationToken: String,
  googleId: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return ;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err; 
  }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);