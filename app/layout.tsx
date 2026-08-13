import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/karla/400.css";
import "@fontsource/karla/500.css";
import "@fontsource/karla/700.css";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { ChatAgent } from "@/components/agent/ChatAgent";

export const metadata: Metadata = {
  title: "Mehran Dental Care — Hyderabad",
  description:
    "Neighborhood dental clinic in Latifabad, Hyderabad. Scaling, whitening, root treatment, dentures, orthodontics, and more.",
  manifest: "/manifest.json",
};

// Inline script to prevent flash of wrong theme
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('mdc-theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
      style={
        {
          ["--font-manrope" as string]: "'Manrope Variable', sans-serif",
          ["--font-karla" as string]: "'Karla', sans-serif",
        } as React.CSSProperties
      }
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <ChatAgent />
        </ThemeProvider>
      </body>
    </html>
  );
}