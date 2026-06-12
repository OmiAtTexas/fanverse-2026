'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/home', emoji: '🏠', label: 'Home' },
  { href: '/matches', emoji: '⚽', label: 'Matches' },
  { href: '/fans', emoji: '👥', label: 'Fans' },
  { href: '/messages', emoji: '💬', label: 'Messages' },
  { href: '/groups', emoji: '🫂', label: 'Groups' },
  { href: '/ai', emoji: '🤖', label: 'AI' },
  { href: '/passport', emoji: '🏅', label: 'Passport' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-t border-gray-800 flex justify-around py-2 px-1">
      {navItems.map(({ href, emoji, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 py-1 min-w-[36px] transition-all ${active ? 'text-yellow-500' : 'text-gray-600'}`}>
            <span className={`text-lg transition-transform ${active ? 'scale-110' : ''}`}>{emoji}</span>
            <span className={`text-[8px] font-semibold ${active ? 'text-yellow-500' : 'text-gray-600'}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
