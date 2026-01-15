// components/Layout/layout.tsx
import Head from "next/head";
import Header from "@/components/Header/header";
import styles from "./layout.module.scss";

export default function Layout({
    title,
    children,
}: {
    title?: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <Head>
                <title>{title ? `${title} · Song Studio` : "Song Studio"}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={styles.shell}>
                <Header />
                <main className={styles.main}>{children}</main>
            </div>
        </>
    );
}
