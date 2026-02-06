# Frontend Auth — Sync with Session-Based Backend

The backend switched from JWT (access+refresh tokens) to a single session token. The frontend still references the old JWT field names. Here's what needs to change:

## 1. Login.tsx — Update to new API contract

- Backend returns `tokenExpiresAt` (single field), but Login.tsx saves `accessTokenExpiresAt` and `refreshTokenExpiresAt`
- Update localStorage key to `tokenExpiresAt`

## 2. Home.tsx — Update token debug display

- Reads `accessTokenExpiresAt` / `refreshTokenExpiresAt` from localStorage
- Update to show single `tokenExpiresAt` countdown instead

## 3. Sidebar.tsx — Fix localStorage cleanup on logout

- Currently removes `accessTokenExpiresAt` and `refreshTokenExpiresAt`
- Update to remove `tokenExpiresAt`

## 4. Global 401 handling (session expiry)

- Currently no handling when session expires mid-use
- Add a global response interceptor or React Query `onError` handler that redirects to login on 401

## Files to modify

- `apps/web/src/pages/login/Login.tsx`
- `apps/web/src/pages/home/Home.tsx`
- `apps/web/src/Sidebar.tsx`
- `apps/web/src/App.tsx` (for 401 handling)
