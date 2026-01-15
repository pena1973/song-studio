// pages/_app.tsx
import type { AppProps } from "next/app";
import "@/styles/globals.scss";

// важно: один раз инициализируем i18n на клиенте
import "@/i18n";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
