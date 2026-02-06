import type { Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

export function setSessionCookie(res: Response, token: string): void {
  res.cookie('session_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie('session_token', { path: '/' });
}
