import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/karla/400.css";
import "@fontsource/karla/500.css";
import "@fontsource/karla/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mehran Dental Care — Hyderabad",
  description:
    "Neighborhood dental clinic in Latifabad, Hyderabad. Scaling, whitening, root treatment, dentures, orthodontics, and more.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" style={{ ["--font-manrope" as string]: "'Manrope Variable', sans-serif", ["--font-karla" as string]: "'Karla', sans-serif" }}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
