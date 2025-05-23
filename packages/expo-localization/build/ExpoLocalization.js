/* eslint-env browser */
import { Platform } from 'expo-modules-core';
import * as rtlDetect from 'rtl-detect';
const getNavigatorLocales = () => {
    return Platform.isDOMAvailable ? navigator.languages || [navigator.language] : [];
};
const WEB_LANGUAGE_CHANGE_EVENT = 'languagechange';
// https://wisevoter.com/country-rankings/countries-that-use-fahrenheit/
const USES_FAHRENHEIT = [
    'AG',
    'BZ',
    'VG',
    'FM',
    'MH',
    'MS',
    'KN',
    'BS',
    'CY',
    'TC',
    'US',
    'LR',
    'PW',
    'KY',
];
export function addLocaleListener(
// NOTE(@kitten): We never use the event's data
listener) {
    addEventListener(WEB_LANGUAGE_CHANGE_EVENT, listener);
    return {
        remove: () => removeEventListener(WEB_LANGUAGE_CHANGE_EVENT, listener),
    };
}
export function addCalendarListener(
// NOTE(@kitten): We never use the event's data
listener) {
    addEventListener(WEB_LANGUAGE_CHANGE_EVENT, listener);
    return {
        remove: () => removeEventListener(WEB_LANGUAGE_CHANGE_EVENT, listener),
    };
}
export function removeSubscription(subscription) {
    subscription.remove();
}
export default {
    get currency() {
        // TODO: Add support
        return null;
    },
    get decimalSeparator() {
        return (1.1).toLocaleString().substring(1, 2);
    },
    get digitGroupingSeparator() {
        const value = (1000).toLocaleString();
        return value.length === 5 ? value.substring(1, 2) : '';
    },
    get isRTL() {
        return rtlDetect.isRtlLang(this.locale) ?? false;
    },
    get isMetric() {
        const { region } = this;
        switch (region) {
            case 'US': // USA
            case 'LR': // Liberia
            case 'MM': // Myanmar
                return false;
        }
        return true;
    },
    get locale() {
        if (!Platform.isDOMAvailable) {
            return '';
        }
        const locale = navigator.language ||
            navigator['systemLanguage'] ||
            navigator['browserLanguage'] ||
            navigator['userLanguage'] ||
            this.locales[0];
        return locale;
    },
    get locales() {
        if (!Platform.isDOMAvailable) {
            return [];
        }
        const { languages = [] } = navigator;
        return Array.from(languages);
    },
    get timezone() {
        const defaultTimeZone = 'Etc/UTC';
        if (typeof Intl === 'undefined') {
            return defaultTimeZone;
        }
        return Intl.DateTimeFormat().resolvedOptions().timeZone || defaultTimeZone;
    },
    get isoCurrencyCodes() {
        // TODO(Bacon): Add this - very low priority
        return [];
    },
    get region() {
        // There is no way to obtain the current region, as is possible on native.
        // Instead, use the country-code from the locale when possible (e.g. "en-US").
        const { locale } = this;
        const [, ...suffixes] = typeof locale === 'string' ? locale.split('-') : [];
        for (const suffix of suffixes) {
            if (suffix.length === 2) {
                return suffix.toUpperCase();
            }
        }
        return null;
    },
    getLocales() {
        const locales = getNavigatorLocales();
        return locales?.map((languageTag) => {
            // TextInfo is an experimental API that is not available in all browsers.
            // We might want to consider using a locale lookup table instead.
            let locale = {};
            // Properties added only for compatibility with native, use `toLocaleString` instead.
            let digitGroupingSeparator = null;
            let decimalSeparator = null;
            let temperatureUnit = null;
            // Gracefully handle language codes like `en-GB-oed` which is unsupported
            // but is otherwise a valid language tag (grandfathered)
            try {
                digitGroupingSeparator =
                    Array.from((10000).toLocaleString(languageTag)).filter((c) => c > '9' || c < '0')[0] ||
                        null; // using 1e5 instead of 1e4 since for some locales (like pl-PL) 1e4 does not use digit grouping
                decimalSeparator = (1.1).toLocaleString(languageTag).substring(1, 2);
                if (typeof Intl !== 'undefined') {
                    locale = new Intl.Locale(languageTag);
                }
            }
            catch { }
            const { region, textInfo, language, script } = locale;
            if (region) {
                temperatureUnit = regionToTemperatureUnit(region);
            }
            return {
                languageTag,
                languageCode: language || languageTag.split('-')[0] || 'en',
                languageScriptCode: script || null,
                textDirection: textInfo?.direction || null,
                digitGroupingSeparator,
                decimalSeparator,
                measurementSystem: null,
                currencyCode: null,
                currencySymbol: null,
                languageCurrencyCode: null,
                languageCurrencySymbol: null,
                // On web, we don't have a way to get the region code, except from the language tag. `regionCode` and `languageRegionCode` are the same.
                regionCode: region || null,
                languageRegionCode: region || null,
                temperatureUnit,
            };
        });
    },
    getCalendars() {
        const locale = ((typeof Intl !== 'undefined'
            ? Intl.DateTimeFormat().resolvedOptions()
            : null) ?? null);
        return [
            {
                calendar: (locale?.calendar || locale?.calendars?.[0]) || null,
                timeZone: locale?.timeZone || locale?.timeZones?.[0] || null,
                uses24hourClock: (locale?.hourCycle || locale?.hourCycles?.[0])?.startsWith('h2') ?? null, //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/hourCycle
                firstWeekday: locale?.weekInfo?.firstDay || null,
            },
        ];
    },
    async getLocalizationAsync() {
        const { currency, decimalSeparator, digitGroupingSeparator, isoCurrencyCodes, isMetric, isRTL, locale, locales, region, timezone, } = this;
        return {
            currency,
            decimalSeparator,
            digitGroupingSeparator,
            isoCurrencyCodes,
            isMetric,
            isRTL,
            locale,
            locales,
            region,
            timezone,
        };
    },
};
function regionToTemperatureUnit(region) {
    return USES_FAHRENHEIT.includes(region) ? 'fahrenheit' : 'celsius';
}
//# sourceMappingURL=ExpoLocalization.js.map