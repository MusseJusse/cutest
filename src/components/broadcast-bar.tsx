import Link from "next/link";

export default function BroadcastBar({
  slate,
  href,
  linkLabel,
}: {
  slate: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <header className="flex items-center gap-3 rounded-xl border border-broadcast-dim/25 bg-white/[0.03] px-4 py-3">
      <p className="m-0 flex items-center gap-2 font-display text-[13px] tracking-[0.2em] text-broadcast-dim uppercase">
        <b className="-skew-x-6 bg-broadcast-gold px-2 py-0.5 text-lg font-normal tracking-[0.04em] text-[#0a0e18]">
          RC
        </b>
        Sports
      </p>
      <p className="m-0 hidden flex-1 text-[11px] tracking-[0.15em] text-broadcast-dim uppercase sm:block">
        {slate}
      </p>
      <p className="m-0 ml-auto flex items-center gap-1.5 text-[11px] tracking-[0.15em] text-broadcast-gold uppercase sm:ml-0">
        <i
          aria-hidden="true"
          className="live-dot h-[7px] w-[7px] rounded-full bg-broadcast-gold"
        />
        Live
      </p>
      <Link
        href={href}
        className="rounded-md border border-broadcast-ink/30 px-2.5 py-1.5 text-[11px] tracking-[0.15em] text-broadcast-ink/70 uppercase transition-colors duration-150 ease-out hover:border-broadcast-gold hover:bg-broadcast-gold/10 hover:text-broadcast-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-broadcast-gold"
      >
        {linkLabel}
      </Link>
    </header>
  );
}
