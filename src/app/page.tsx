import { ViewTransition } from "react";
import FinalHomepage from "~/components/final-homepage";

export default function HomePage() {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      <FinalHomepage />
    </ViewTransition>
  );
}
