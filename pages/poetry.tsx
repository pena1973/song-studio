import Layout from "@/components/Layout/layout";
import { useTranslation } from "react-i18next";

export default function PoetryPage() {
  const { t } = useTranslation("common");

  return (
    <Layout title={t("pages.poetry.title")}>
      <h1>{t("pages.poetry.title")}</h1>
      <p>{t("pages.poetry.desc")}</p>
    </Layout>
  );
}
