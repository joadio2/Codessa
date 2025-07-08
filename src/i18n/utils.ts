import { ui, defaultLang } from "./ui";

export type Lang = keyof typeof ui;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: Lang): (key: string) => string {
  return function t(key: string): string {
    const keys = key.split(".");
    let value: any = ui[lang];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    // Si no existe, busca en el idioma por defecto
    if (value === undefined) {
      value = ui[defaultLang];
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
    }
    return value ?? key;
  };
}
