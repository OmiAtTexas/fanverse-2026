import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-bebas text-5xl text-gold tracking-widest">JOIN FANVERSE 2026</h1>
          <p className="text-muted text-sm mt-2">Connect with fans worldwide</p>
        </div>
        <SignUp
          appearance={{
            variables: { colorPrimary: '#C9A227', colorBackground: '#1A1A1A', colorText: '#F5F5F5' },
          }}
          afterSignUpUrl="/onboarding"
        />
      </div>
    </main>
  );
}
