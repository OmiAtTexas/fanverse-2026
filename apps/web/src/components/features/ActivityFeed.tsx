'use client';

export function ActivityFeed() {
  const items = [
    { id: 1, type: 'match', text: 'Argentina vs France kicks off in 2h 15m', icon: '⚽', time: '2h' },
    { id: 2, type: 'fan', text: 'Carlos M. accepted your connection', icon: '🤝', time: '45m' },
    { id: 3, type: 'group', text: 'New message in Argentina Fans Dallas', icon: '💬', time: '12m' },
    { id: 4, type: 'stamp', text: 'You earned the "Dallas Explorer" stamp!', icon: '🏅', time: '1d' },
  ];

  const colors: Record<string, string> = {
    match: 'text-wc-red',
    fan: 'text-gold',
    group: 'text-blue-400',
    stamp: 'text-wc-green',
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="card-dark flex items-start gap-3 p-3">
          <span className="text-xl">{item.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-snug">{item.text}</p>
          </div>
          <span className="text-xs text-muted shrink-0">{item.time}</span>
        </div>
      ))}
    </div>
  );
}
