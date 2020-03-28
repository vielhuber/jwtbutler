export default class helpers {
    static cookieExists(cookie_name) {
        if (document.cookie !== undefined && this.cookieGet(cookie_name) !== null) {
            return true;
        }
        return false;
    }

    static cookieGet(cookie_name) {
        var cookie_match = document.cookie.match(new RegExp(cookie_name + '=([^;]+)'));
        if (cookie_match) {
            return decodeURIComponent(cookie_match[1]);
        }
        return null;
    }

    static cookieSet(cookie_name, cookie_value, days) {
        let samesite = '';
        if (window.location.protocol.indexOf('https') > -1) {
            samesite = '; SameSite=None; Secure';
        }
        document.cookie =
            cookie_name +
            '=' +
            encodeURIComponent(cookie_value) +
            '; ' +
            'expires=' +
            new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000).toUTCString() +
            '; path=/' +
            samesite;
    }

    static cookieDelete(cookie_name) {
        let samesite = '';
        if (window.location.protocol.indexOf('https') > -1) {
            samesite = '; SameSite=None; Secure';
        }
        document.cookie = cookie_name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/' + samesite;
    }

    static remove(el) {
        if (el !== null) {
            el.parentNode.removeChild(el);
        }
    }
}
