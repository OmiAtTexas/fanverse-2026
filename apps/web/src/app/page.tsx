'use client';

import { useUser, useClerk } from '@clerk/nextjs';

export default function HomePage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-yellow-900 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-yellow-500 tracking-widest uppercase">FanVerse</h1>
          <p className="text-xs text-gray-500">FIFA World Cup 2026</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.imageUrl && (
            <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full border border-yellow-700" />
          )}
          <button
            onClick={() => signOut()}
            className="text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome, <span className="text-yellow-500">{user?.firstName || 'Fan'}</span> 👋
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Your World Cup journey starts here</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '⚽', label: 'Browse Matches', href: '/matches', color: 'border-red-900 hover:border-red-600' },
            { icon: '🤝', label: 'Find Fans', href: '/fans', color: 'border-yellow-900 hover:border-yellow-600' },
            { icon: '💬', label: 'Fan Groups', href: '/groups', color: 'border-blue-900 hover:border-blue-600' },
            { icon: '🗺️', label: 'AI Guide', href: '/ai', color: 'border-purple-900 hover:border-purple-600' },
            { icon: '🏅', label: 'My Passport', href: '/passport', color: 'border-green-900 hover:border-green-600' },
            { icon: '📍', label: 'Meetups', href: '/meetups', color: 'border-orange-900 hover:border-orange-600' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`bg-gray-900 border ${item.color} rounded-2xl p-4 flex flex-col gap-2 transition-all`}
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-sm font-medium text-white">{item.label}</span>
            </a>
          ))}
        </div>

        <div className="bg-gray-900 border border-yellow-900 rounded-2xl p-4">
          <p className="text-xs text-yellow-500 font-semibold uppercase tracking-wider mb-1">🚧 Setting Up</p>
          <p className="text-sm text-gray-400">AI fan matching, real-time chat, and travel companion are being configured.</p>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 flex justify-around py-3 px-4">
        {[
          { label: 'Home', href: '/home', emoji: '🏠' },
          { label: 'Fans', href: '/fans', emoji: '👥' },
          { label: 'AI Guide', href: '/ai', emoji: '🗺️' },
          { label: 'Groups', href: '/groups', emoji: '💬' },
          { label: 'Passport', href: '/passport', emoji: '🏅' },
        ].map((item) => (
          <a key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-yellow-500 transition-colors">
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px]">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}