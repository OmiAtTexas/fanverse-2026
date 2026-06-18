'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallback() {
  return (
    <div style={{ minHeight: '100vh', background: '#020F2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🏆</p>
        <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Signing you in...</p>
      </div>
      <AuthenticateWithRedirectCallback afterSignInUrl="/home" afterSignUpUrl="/onboarding" />
    </div>
  );
}
