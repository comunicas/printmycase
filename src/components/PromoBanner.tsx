const PromoBanner = () => {
  return (
    <div className="border-b border-primary-foreground/15 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-center gap-2 px-3 text-center text-xs font-medium sm:h-11 sm:px-5 sm:text-sm">
        <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground sm:text-xs">
          20% OFF
        </span>
        <span className="truncate">
          Use o cupom <strong className="font-semibold">PRIMEIRACOMPRA</strong>
          <span className="hidden sm:inline"> na sua primeira compra</span>
        </span>
      </div>
    </div>
  );
};

export default PromoBanner;