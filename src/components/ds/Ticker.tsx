interface TickerProps {
  items: string[];
  speed?: number;
}

export default function Ticker({ items, speed = 30 }: TickerProps) {
  const joined = items.join(' ✦ ');

  return (
    <div
      className="w-full overflow-hidden border-y border-border py-2.5"
      style={{ background: 'var(--surface-1)' }}
    >
      <div
        className="inline-flex"
        style={{ animation: `ticker ${speed}s linear infinite` }}
      >
        <span className="text-sm text-muted-foreground whitespace-nowrap px-4">
          {joined}
        </span>
        <span className="text-sm text-muted-foreground whitespace-nowrap px-4" aria-hidden="true">
          {joined}
        </span>
      </div>
    </div>
  );
}
