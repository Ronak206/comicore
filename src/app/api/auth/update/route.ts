/**
 * Update User Profile API Route
 * PUT /api/auth/update
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = updateSchema.parse(body);
    
    await connectDB();
    
    // If email is being updated, check if it's already taken
    if (validatedData.email && validatedData.email !== session.email) {
      const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'Email already in use',
        }, { status: 409 });
      }
    }
    
    // Update user
    const updateData: Record<string, string> = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) updateData.email = validatedData.email.toLowerCase();
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
    
    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan,
        avatar: updatedUser.avatar,
      },
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile',
    }, { status: 500 });
  }
}
