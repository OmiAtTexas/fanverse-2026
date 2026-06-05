'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Map, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/fans', icon: Users, label: 'Fans' },
  { href: '/ai', icon: Map, label: 'AI Guide' },
  { href: '/groups', icon: BookOpen, label: 'Groups' },
  { href: '/passport', icon: User, label: 'Passport' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-[52px]',
                active ? 'text-gold' : 'text-muted hover:text-foreground',
              )}
            >
              <Icon
                size={22}
                className={cn('transition-transform', active && 'scale-110')}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span className={cn('text-[10px] font-medium', active ? 'text-gold' : 'text-muted')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
