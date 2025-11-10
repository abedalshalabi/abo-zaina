const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8000/api'
  : 'https://abozaina.ps/api';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

export const API_V1_BASE_URL = `${API_BASE_URL}/v1`;

const DEFAULT_STORAGE_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8000/storage'
  : 'https://abozaina.ps/storage';

export const STORAGE_BASE_URL = (import.meta.env.VITE_STORAGE_BASE_URL || DEFAULT_STORAGE_BASE_URL).replace(/\/$/, '');
