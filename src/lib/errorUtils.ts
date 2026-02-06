/**
 * Safe error message utility - prevents database schema disclosure
 */

interface ErrorWithCode {
  code?: string;
  message?: string;
}

/**
 * Maps database/API errors to safe user-facing messages
 * Prevents disclosure of table names, column names, and policy information
 */
export function getSafeErrorMessage(error: ErrorWithCode | unknown, context?: string): string {
  const err = error as ErrorWithCode;
  const message = err?.message || '';
  const code = err?.code || '';

  // Auth errors are generally safe to show (designed for end-users)
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please verify your email before signing in';
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists';
  }
  if (message.includes('Password should be at least')) {
    return message; // Password requirements are safe
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please try again later.';
  }

  // Database constraint errors - map to generic messages
  if (code === '23505') { // unique_violation
    return context 
      ? `This ${context} already exists` 
      : 'This item already exists';
  }
  if (code === '23503') { // foreign_key_violation
    return context 
      ? `Cannot delete this ${context} - it is in use` 
      : 'Cannot delete - this item is referenced elsewhere';
  }
  if (code === '23502') { // not_null_violation
    return 'Please fill in all required fields';
  }

  // RLS policy violations
  if (message.includes('violates row-level security') || message.includes('new row violates')) {
    return 'You do not have permission to perform this action';
  }

  // Network errors
  if (message.includes('Failed to fetch') || message.includes('network')) {
    return 'Connection error. Please check your internet and try again.';
  }

  // Default safe message
  return 'An error occurred. Please try again or contact support.';
}

/**
 * Safe auth error message - keeps auth-specific errors that are user-friendly
 */
export function getSafeAuthErrorMessage(error: ErrorWithCode | unknown): string {
  const err = error as ErrorWithCode;
  const message = err?.message || '';

  // These auth errors are designed to be shown to users
  const safeAuthErrors = [
    'Invalid login credentials',
    'Email not confirmed',
    'User already registered',
    'Password should be at least',
    'rate limit',
    'session',
    'token',
  ];

  if (safeAuthErrors.some(safe => message.toLowerCase().includes(safe.toLowerCase()))) {
    return message;
  }

  // For other errors, return a generic message
  return getSafeErrorMessage(error, 'account');
}
