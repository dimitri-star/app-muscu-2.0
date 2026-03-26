// URL of the web (Next.js) server
// Change the port if your web app runs on a different one
const PROD_WEB_API_URL = 'https://appmuscu2.netlify.app';
const DEV_WEB_API_URL = 'http://localhost:3001';

// On deployed mobile web, point to the hosted Next.js API.
// You can override with EXPO_PUBLIC_WEB_API_URL when needed.
export const WEB_API_URL =
  process.env.EXPO_PUBLIC_WEB_API_URL ??
  (process.env.NODE_ENV === 'production' ? PROD_WEB_API_URL : DEV_WEB_API_URL);

export const PROGRAMME_API = `${WEB_API_URL}/api/programme`;
export const SEANCES_API = `${WEB_API_URL}/api/seances`;
export const PROFILE_API = `${WEB_API_URL}/api/profile`;
export const RECORDS_API = `${WEB_API_URL}/api/records`;
export const WEEKLY_TRACKING_API = `${WEB_API_URL}/api/weekly-tracking`;
