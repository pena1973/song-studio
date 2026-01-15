import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./header.module.scss";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";
type Lang = "ru" | "en";

function getSavedTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const t = localStorage.getItem("theme");
  return t === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export default function Header() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");

  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("ru");

  useEffect(() => {
    // theme
    const th = getSavedTheme();
    setTheme(th);
    applyTheme(th);

    // lang
    const savedLang = (localStorage.getItem("lang") as Lang | null) ?? "ru";
    setLang(savedLang);
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  const nav = useMemo(
    () => [
      { href: "/music", label: t("nav.music") },
      { href: "/poetry", label: t("nav.poetry") },
      { href: "/settings", label: t("nav.settings") },
    ],
    [t]
  );

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
  }

  function toggleLang() {
    const next: Lang = lang === "ru" ? "en" : "ru";
    setLang(next);
    localStorage.setItem("lang", next);
    i18n.changeLanguage(next);
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/music" className={styles.logo}>
          Song Studio
        </Link>

        <nav className={styles.nav}>
          {nav.map((item) => {
            const active = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.link} ${active ? styles.active : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.right}>
        <button className={styles.btn} onClick={toggleLang} title="Language">
          {lang.toUpperCase()}
        </button>

        <button className={styles.btn} onClick={toggleTheme} title="Theme">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
    </header>
  );
}
