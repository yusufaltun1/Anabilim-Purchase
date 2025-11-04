import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { msalConfig } from './config/msalConfig'
import './index.css'
import App from './App.tsx'

/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const msalInstance = new PublicClientApplication(msalConfig);

// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

// Listen for sign-in event and set active account
msalInstance.addEventCallback((event) => {
    console.log('🎯 MSAL Event:', event.eventType);
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        console.log('✅ MSAL LOGIN_SUCCESS - Setting active account');
        const account = event.payload as any;
        if (account.account) {
            msalInstance.setActiveAccount(account.account);
        }
        // AuthContext will handle the redirect to dashboard
    }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App instance={msalInstance} />
  </StrictMode>,
)
