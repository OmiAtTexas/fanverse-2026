'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/home', label: 'Home', icon: '🏠', color: '#e8003d' },
  { href: '/matches', label: 'Matches', icon: '⚽', color: '#ff5c1a' },
  { href: '/fans', label: 'Fans', icon: '👥', color: '#7b2fff' },
  { href: '/messages', label: 'DMs', icon: '💬', color: '#00c2a8' },
  { href: '/groups', label: 'Groups', icon: '🫂', color: '#00e676' },
  { href: '/ai', label: 'AI', icon: '🤖', color: '#ffd700' },
  { href: '/passport', label: 'Passport', icon: '🏅', color: '#c9a227' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {navItems.map(({ href, label, icon, color }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '4px 6px', borderRadius: 10, textDecoration: 'none',
            background: active ? `${color}25` : 'transparent',
            transition: 'all 0.2s', minWidth: 36,
          }}>
            <span style={{ fontSize: 17, filter: active ? 'none' : 'grayscale(60%) brightness(0.5)', transition: 'all 0.2s' }}>{icon}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: active ? color : 'var(--text3)', letterSpacing: 0.5, transition: 'color 0.2s' }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
