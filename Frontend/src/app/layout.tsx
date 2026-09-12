import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Providers from "@/components/Providers";
import { normalizeLanguage } from "@/i18n/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wallet",
  description: "Wallet — personal monthly budget tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wallet",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a7a62",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("wallet_language")?.value;
  const initialLanguage = normalizeLanguage(langCookie);
  const themeCookie = cookieStore.get("wallet_theme")?.value;
  const initialTheme = themeCookie === "dark" ? "dark" : "light";

  return (
    <html lang={initialLanguage} data-theme={initialTheme} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("wallet_theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);if(!/(?:^|; )wallet_theme=/.test(document.cookie)){document.cookie="wallet_theme="+t+";path=/;max-age=31536000;samesite=lax";}if(t==="dark"){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#0f1714");}}var l=localStorage.getItem("wallet_language");if(l&&!/(?:^|; )wallet_language=/.test(document.cookie)){document.cookie="wallet_language="+l+";path=/;max-age=31536000;samesite=lax";}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers initialLanguage={initialLanguage} initialTheme={initialTheme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
