import { Lock } from "lucide-react";

const PaymentBadges = () => (
  <div className="flex flex-col items-center gap-4 py-6">
    {/* Security badge */}
    <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
      <Lock className="w-3.5 h-3.5" /> Pagamento 100% seguro
    </span>

    {/* Card brands + Pix */}
    <div className="flex items-center gap-4 flex-wrap justify-center">
      {/* Visa */}
      <svg viewBox="0 0 48 32" className="h-7 w-auto text-muted-foreground/60" fill="currentColor" aria-label="Visa">
        <rect width="48" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <path d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm-4.8 0h-2.8l-2.6-8.1c-.1-.5-.4-.9-.8-1.1-1-.5-2.1-.8-3.2-1l.1-.4h4.5c.6 0 1.1.4 1.2 1l1.1 5.9 2.7-6.9h2.8L14.7 21zm13.7-6.8c0-2.7-3.7-2.8-3.7-4 0-.4.4-.8 1.1-.9.7-.1 2 0 2.9.5l.5-2.4c-.7-.3-1.6-.5-2.7-.5-2.8 0-4.8 1.5-4.8 3.7 0 1.6 1.4 2.5 2.5 3 1.1.6 1.5 1 1.5 1.5 0 .8-1 1.2-1.8 1.2-1.1 0-2.2-.3-2.8-.6l-.5 2.4c1 .4 2 .6 3.2.6 3 0 5-1.5 5-3.8l-.4.3zm7.4 6.8h2.5l-2.2-10.5h-2.3c-.5 0-.9.3-1.1.7l-3.9 9.8h2.8l.5-1.5h3.4l.3 1.5zm-2.9-3.6l1.4-3.9.8 3.9h-2.2z" />
      </svg>

      {/* Mastercard */}
      <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Mastercard">
        <rect width="48" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />
        <circle cx="19" cy="16" r="8" className="fill-muted-foreground/40" />
        <circle cx="29" cy="16" r="8" className="fill-muted-foreground/25" />
      </svg>

      {/* Elo */}
      <svg viewBox="0 0 48 32" className="h-7 w-auto text-muted-foreground/60" aria-label="Elo">
        <rect width="48" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <text x="24" y="19" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="system-ui">elo</text>
      </svg>

      {/* Amex */}
      <svg viewBox="0 0 48 32" className="h-7 w-auto text-muted-foreground/60" aria-label="American Express">
        <rect width="48" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <text x="24" y="18" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="system-ui" letterSpacing="0.5">AMEX</text>
      </svg>

      {/* Pix */}
      <svg viewBox="0 0 48 32" className="h-7 w-auto text-muted-foreground/60" aria-label="Pix">
        <rect width="48" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <g transform="translate(24,16) scale(0.55)" fill="currentColor">
          <path d="M8.3 3.7c-1.2-1.2-2.8-1.9-4.5-1.9s-3.3.7-4.5 1.9L-4.4 7.4l3.7 3.7c1.2 1.2 2.8 1.9 4.5 1.9s3.3-.7 4.5-1.9l3.7-3.7L8.3 3.7zM6.6 9.4c-.7.7-1.7 1.1-2.8 1.1s-2.1-.4-2.8-1.1L-1.7 6.7-.4 5.4c.7-.7 1.7-1.1 2.8-1.1s2.1.4 2.8 1.1l2.7 2.7L6.6 9.4z" />
          <path d="M-8.3-3.7c1.2 1.2 2.8 1.9 4.5 1.9s3.3-.7 4.5-1.9L4.4-7.4l-3.7-3.7c-1.2-1.2-2.8-1.9-4.5-1.9s-3.3.7-4.5 1.9l-3.7 3.7L-8.3-3.7zM-6.6-9.4c.7-.7 1.7-1.1 2.8-1.1s2.1.4 2.8 1.1l2.7 2.7L.4-5.4c-.7.7-1.7 1.1-2.8 1.1s-2.1-.4-2.8-1.1L-7.9-8.1l1.3-1.3z" />
        </g>
      </svg>
    </div>

    {/* Powered by Stripe */}
    <div className="flex items-center gap-2 text-muted-foreground/50">
      <div className="w-10 border-t border-muted-foreground/20" />
      <span className="text-xs font-medium tracking-wide">Powered by</span>
      <svg viewBox="0 0 60 25" className="h-5 w-auto" fill="currentColor" aria-label="Stripe" opacity="0.5">
        <path d="M5 10.2c0-.7.6-1 1.5-1 1.4 0 3.1.4 4.5 1.2V6.3C9.4 5.7 7.8 5.4 6.5 5.4 2.6 5.4 0 7.4 0 10.5c0 4.8 6.6 4 6.6 6.1 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.4v4.2c1.7.7 3.3 1 4.9 1 4 0 6.8-2 6.8-5.1C11.7 11.9 5 12.9 5 10.2zm13.5-2.7l-.2-2h-4V20.5h4.6V10c1.1-1.4 2.9-1.1 3.5-.9V5.5c-.6-.2-2.8-.6-3.9 2zm9.3-5L23.2 3.8l-.1 13.4c0 2.5 1.9 4.3 4.3 4.3 1.4 0 2.4-.3 2.9-.5v-3.7c-.5.2-3.2.9-3.2-1.4V9.2h3.2V5.5h-3.2l.7-3zm8.2 5.3l-.3-1.3h-4.4V20.5h4.6v-10c1.1-1.4 2.9-1.2 3.5-1V5.5c-.6-.2-2.9-.6-3.4 2.3zM42 5.5l4.6 0V1.6L42 2.9v2.6zm0 15h4.6V5.5H42v15zm9.5-16.4c0-1.5-1.2-2.7-2.7-2.7-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7c1.5 0 2.7-1.2 2.7-2.7zM60 14c0-5-2.4-8.6-7.1-8.6-4.7 0-7.5 3.6-7.5 8.5 0 5.6 3.3 8.4 8.1 8.4 2.3 0 4.1-.5 5.4-1.3v-3.5c-1.3.7-2.9 1.1-4.8 1.1-1.9 0-3.6-.7-3.8-3h9.6c0-.3.1-1.2.1-1.6zm-9.7-1.8c0-2.2 1.4-3.1 2.6-3.1 1.2 0 2.5.9 2.5 3.1h-5.1z" />
      </svg>
      <div className="w-10 border-t border-muted-foreground/20" />
    </div>
  </div>
);

export default PaymentBadges;
