import { LanguageDevice } from "@common";
import { I18n } from 'i18n-js';
import en from './en-US';
import pt from './pt-BR';

const i18n = new I18n({
    'en_US': en,
    'pt_BR': pt,
    'en': en,
    'pt': pt,
});

i18n.enableFallback = true;
i18n.defaultLocale = 'pt_BR';

const normalizeTranslate = {
    'en_US': 'en_US',
    'pt_BR': 'pt_BR',
    'en': 'en_US',
    'pt_US': 'pt_BR',
    'pt_PT': 'pt_BR',
};

try {
    const language = LanguageDevice();
    if (language && normalizeTranslate[language]) {
        i18n.locale = normalizeTranslate[language];
    } else {
        i18n.locale = 'pt_BR';
    }
} catch (e) {
    i18n.locale = 'pt_BR';
}

export const string = (key, params) => i18n.t(key, params);
export default i18n;