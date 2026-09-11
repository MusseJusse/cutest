import Link from "next/link";

export default function BroadcastBar({
  href,
  linkLabel,
  transitionTypes,
}: {
  href: string;
  linkLabel: string;
  transitionTypes?: string[];
}) {
  return (
    <header className="broadcast-bar flex flex-wrap items-center gap-3 rounded-xl border border-broadcast-dim/25 bg-white/[0.03] px-4 py-3">
      <p className="m-0 flex w-full items-center gap-3 font-display uppercase sm:w-auto sm:flex-1">
        <b className="shrink-0 -skew-x-6 bg-broadcast-gold px-2 py-0.5 text-xl font-normal tracking-[0.04em] text-[#0a0e18]">
          CSL
        </b>
        <span className="text-base tracking-[0.07em] text-broadcast-ink sm:text-lg">
          Cuteness Super League
        </span>
      </p>
      <p className="m-0 mr-auto flex shrink-0 items-center gap-1.5 text-[11px] tracking-[0.15em] text-broadcast-gold uppercase sm:mr-0">
        <i
          aria-hidden="true"
          className="live-dot h-[7px] w-[7px] rounded-full bg-broadcast-gold"
        />
        Live
      </p>
      <Link
        href={href}
        transitionTypes={transitionTypes}
        className="rounded-md border border-broadcast-ink/30 px-2.5 py-1.5 text-[11px] tracking-[0.15em] text-broadcast-ink/70 uppercase transition-colors duration-150 ease-out hover:border-broadcast-gold hover:bg-broadcast-gold/10 hover:text-broadcast-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-broadcast-gold"
      >
        {linkLabel}
      </Link>
    </header>
  );
}
