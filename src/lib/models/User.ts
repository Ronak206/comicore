/**
 * User Model with Authentication
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
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
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    emailVerified: { type: Date },
  },
  { timestamps: true }
);

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const user = await mongoose.models.User.findById(this._id).select('+password');
  if (!user) return false;
  
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, user.password);
};

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
