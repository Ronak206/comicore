/**
 * Register API Route
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerUser, setSessionCookie } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Register user
    const result = await registerUser(
      validatedData.name,
      validatedData.email,
      validatedData.password
    );
    
    // Set session cookie
    await setSessionCookie(result.token);
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: result.user,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }
    
    if (error instanceof Error) {
      if (error.message === 'Email already registered') {
        return NextResponse.json({
          success: false,
          error: error.message,
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create account',
    }, { status: 500 });
  }
}
