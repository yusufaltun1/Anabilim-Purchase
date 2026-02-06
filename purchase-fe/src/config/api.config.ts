const defaultBaseUrl =
  import.meta.env.MODE === 'production'
    ? 'https://testsatinalmaapi.anabilim.k12.tr'
    : 'http://localhost:8080';
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl;
const BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const API_CONFIG = {
  BASE_URL,
}; 