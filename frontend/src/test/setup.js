import '@testing-library/jest-dom/vitest';
import i18n from '../i18n';

// jsdom's default navigator.language ('en-US') would otherwise make the
// language-detector pick English, which makes tests asserting on Uzbek copy
// non-deterministic depending on the runner's environment.
i18n.changeLanguage('uz');
