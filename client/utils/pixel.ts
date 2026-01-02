import { FACEBOOK_PIXEL_ID } from '../config/env';

declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

export const initPixel = () => {
    if (!FACEBOOK_PIXEL_ID) {
        console.warn('Facebook Pixel ID not found in environment variables');
        return;
    }

    if (window.fbq) return;

    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
    })(window, document, 'script',
        'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', FACEBOOK_PIXEL_ID);
};

let lastEvent: { name: string; data: string; time: number } | null = null;

export const trackEvent = (event: string, data?: any) => {
    if (!FACEBOOK_PIXEL_ID) return;

    // Prevent duplicate events within 1 second (fixes StrictMode double firing)
    const now = Date.now();
    const dataString = JSON.stringify(data);

    if (
        lastEvent &&
        lastEvent.name === event &&
        lastEvent.data === dataString &&
        (now - lastEvent.time) < 1000
    ) {
        return;
    }

    lastEvent = { name: event, data: dataString, time: now };

    if (window.fbq) {
        window.fbq('track', event, data);
    } else {
        // Retry once after a slight delay if script is still loading
        setTimeout(() => {
            if (window.fbq) {
                window.fbq('track', event, data);
            }
        }, 500);
    }
};
