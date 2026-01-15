import Layout from "@/components/Layout/layout";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("pages.settings.title")}>
      <h1>{t("pages.settings.title")}</h1>
      <p>{t("pages.settings.desc")}</p>
    </Layout>
  );
}
