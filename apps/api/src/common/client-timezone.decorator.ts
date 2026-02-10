import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientTimezone = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const raw = request.headers['x-timezone'];
    const tz = typeof raw === 'string' ? raw : 'UTC';
    return isValidTimezone(tz) ? tz : 'UTC';
  },
);

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
