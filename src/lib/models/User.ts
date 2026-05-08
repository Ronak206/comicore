/**
 * User Model with Authentication
 */

import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  plan: "free" | "pro" | "enterprise";
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, default: "Creator" },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true 
    },
    password: { type: String, required: true, select: false },
    avatar: { type: String },
    bio: { type: String, maxlength: 500, default: "" },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    emailVerified: { type: Date },
  },
  { timestamps: true }
);

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const user = await mongoose.models.User.findById(this._id).select('+password');
  if (!user) return false;
  
  return bcrypt.compare(candidatePassword, user.password);
};

// Pre-save hook to hash password (Mongoose 8+ async style - no next() needed)
UserSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;
  
  // Hash the password with a salt rounds of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
