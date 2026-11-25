import { ViewTransition, type ComponentProps, type ReactNode } from "react";
import SiteHeader from "~/components/site-header";
import { cn } from "~/lib/utils";

type TransitionClass = ComponentProps<typeof ViewTransition>["enter"];

const BASE_TRANSITION: TransitionClass = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
};

const PAGED_TRANSITION: TransitionClass = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  "nav-page": "page-fade",
  default: "none",
};

export default function PageShell({
  page,
  title,
  titleClassName,
  headingSpacingClassName,
  pageFade = false,
  children,
}: {
  page: "vote" | "rankings";
  title: string;
  titleClassName: string;
  headingSpacingClassName: string;
  pageFade?: boolean;
  children: ReactNode;
}) {
  const transition = pageFade ? PAGED_TRANSITION : BASE_TRANSITION;

  return (
    <ViewTransition enter={transition} exit={transition} default="none">
      <section className="px-4 py-5 sm:px-6 sm:py-8">
        <div className="@container mx-auto max-w-[960px]">
          <SiteHeader page={page} />
          <div className={cn("text-center", headingSpacingClassName)}>
            <h1
              className={cn(
                "font-display leading-tight font-bold text-ring-ink",
                titleClassName,
              )}
            >
              {title}
            </h1>
          </div>
          {children}
        </div>
      </section>
    </ViewTransition>
  );
}
