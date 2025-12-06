import i18n from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

try {
  i18n.use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../locales/${language}/${namespace}.json`)
    )
  );
  i18n.on('failedLoading', (_lng, _ns, msg) => console.error(msg));
  i18n.init({
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });
  i18n.languages = ['en', 'fr'];
} catch (error) {
  console.error('i18n initialization error:', error);
}

export default i18n;

