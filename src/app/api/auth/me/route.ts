/**
 * Get Current User API Route
 * GET /api/auth/me
 */

import { NextResponse } from 'next/server';
import { getCurrentUser, getSession } from '@/lib/auth';

export async function GET() {
  try {
    // First check if session exists
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }
    
    // Then get the full user from database
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get user',
    }, { status: 500 });
  }
}
