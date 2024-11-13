import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      // keyframes: {
      //   "fade-in": {
      //     "0%": { opacity: "0" },
      //     "100%": { opacity: "1" },
      //   },
      // },
      // animation: {
      //   "fade-in": "fade-in 0.2s ease-in-out",
      // },
    },
  },
  plugins: [],
} satisfies Config;
