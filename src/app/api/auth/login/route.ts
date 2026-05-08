/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginUser, setSessionCookie } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Login user
    const result = await loginUser(
      validatedData.email,
      validatedData.password
    );
    
    // Set session cookie
    await setSessionCookie(result.token);
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: result.user,
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 });
    }
    
    if (error instanceof Error) {
      if (error.message === 'Invalid email or password') {
        return NextResponse.json({
          success: false,
          error: error.message,
        }, { status: 401 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Login failed',
    }, { status: 500 });
  }
}
