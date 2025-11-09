export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://abozaina.ps/abozaina/public/api').replace(/\/$/, '');

export const API_V1_BASE_URL = `${API_BASE_URL}/v1`;

export const STORAGE_BASE_URL = (import.meta.env.VITE_STORAGE_BASE_URL || 'https://abozaina.ps/abozaina/public/storage').replace(/\/$/, '');
