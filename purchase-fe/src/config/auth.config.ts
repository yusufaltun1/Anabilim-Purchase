export const AUTH_CONFIG = {
  BASE_URL: 'http://localhost:9090',
  REALM: 'oteller',
  CLIENT_ID: 'api',
  CLIENT_SECRET: 'iP3I7htMb1sTZtcaMs6Wf2dx2927JIMj',
  GRANT_TYPE: 'password',
  SCOPE: 'profile',
  TOKEN_ENDPOINT: '/realms/oteller/protocol/openid-connect/token'
} as const; 