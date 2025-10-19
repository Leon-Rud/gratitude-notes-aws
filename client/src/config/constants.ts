export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');
export const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;

export const ID_PATTERN = /^[A-Za-z0-9\-_]{3,100}$/;
export const MISSING_CONFIG_MESSAGE = 'API is not configured. Please set VITE_API_BASE_URL and VITE_API_KEY.';

export const STATUS_TITLES = {
  invalidId: 'Invalid customer ID',
  createSuccess: 'Customer ID stored',
  createError: 'Unable to store ID',
  checkFound: 'ID found',
  checkMissing: 'ID not found',
  checkError: 'Unable to check ID',
  deleteSuccess: 'ID deleted',
  deleteError: 'Unable to delete ID'
} as const;
