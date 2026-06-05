import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-bebas text-5xl text-gold tracking-widest">FANVERSE 2026</h1>
          <p className="text-muted text-sm mt-2">Your World Cup Companion</p>
        </div>
        <SignIn
          appearance={{
            variables: { colorPrimary: '#C9A227', colorBackground: '#1A1A1A', colorText: '#F5F5F5' },
          }}
          afterSignInUrl="/home"
          redirectUrl="/home"
        />
      </div>
    </main>
  );
}
