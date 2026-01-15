import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ruCommon from "@/public/locales/ru/common.json";
import enCommon from "@/public/locales/en/common.json";

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        ru: { common: ruCommon },
        en: { common: enCommon },
      },
      lng: "ru",
      fallbackLng: "en",
      ns: ["common"],
      defaultNS: "common",
      interpolation: {
        escapeValue: false,
      },
    });
}

export default i18n;
