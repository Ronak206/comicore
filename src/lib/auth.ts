/**
 * Authentication Utilities
 * 
 * Handles password hashing, JWT generation, and session management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from './models/User';
import { connectDB } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'comicore-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'comicore_session';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  plan: string;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    // Ensure cookie works in all environments
    ...(isProduction ? {} : { domain: undefined }),
  });
  
  console.log('[Auth] Session cookie set successfully');
}

/**
 * Get current session from cookie
 */
export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!token) {
      console.log('[Auth] No session cookie found');
      return null;
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      console.log('[Auth] Token verification failed');
      return null;
    }
    
    console.log('[Auth] Session found for user:', payload.email);
    return payload;
  } catch (error) {
    console.error('[Auth] Error getting session:', error);
    return null;
  }
}

/**
 * Clear session cookie
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current user from database
 */
export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session) {
    console.log('[Auth] No session, returning null user');
    return null;
  }
  
  try {
    await connectDB();
    
    const user = await User.findById(session.userId).select('-password');
    
    if (!user) {
      console.log('[Auth] User not found in database for ID:', session.userId);
      return null;
    }
    
    console.log('[Auth] User found:', user.email);
    return user;
  } catch (error) {
    console.error('[Auth] Error fetching user:', error);
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser(name: string, email: string, password: string) {
  await connectDB();
  
  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    plan: 'free',
  });
  
  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    plan: user.plan,
  });
  
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      avatar: user.avatar,
    },
    token,
  };
}

/**
 * Login a user
 */
export async function loginUser(email: string, password: string) {
  await connectDB();
  
  // Find user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Compare password
  const isValid = await comparePassword(password, user.password);
  
  if (!isValid) {
    throw new Error('Invalid email or password');
  }
  
  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    plan: user.plan,
  });
  
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      avatar: user.avatar,
    },
    token,
  };
}
