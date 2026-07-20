import helpers from './_helpers';

export default class jwtbutler {
    constructor(config) {
        if (!('auth_login' in config)) {
            config.auth_login = 'email';
        }
        if (!('captcha' in config)) {
            config.captcha = false;
        }
        if (!('passkeys' in config)) {
            config.passkeys = false;
        }
        if (!('language' in config)) {
            config.language = 'en';
        }
        this.config = config;
    }

    isLoggedIn() {
        if (this.getPayload() === null) {
            return false;
        }
        return true;
    }

    getUserId() {
        let payload = this.getPayload();
        if (payload === null) {
            return null;
        }
        return payload.sub;
    }

    getPayload() {
        if (helpers.cookieGet('access_token') === null) {
            return null;
        }
        try {
            return JSON.parse(atob(helpers.cookieGet('access_token').split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    logout() {
        return new Promise((resolve, reject) => {
            this.addLoadingState('logging-out');
            fetch(this.config.auth_server + '/logout', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Authorization: 'Bearer ' + helpers.cookieGet('access_token')
                },
                cache: 'no-cache'
            })
                .then(res => res.json())
                .catch(err => err)
                .then(response => {
                    this.setCookies(null)
                        .then(() => {
                            this.removeLoadingStates();
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        });
                });
        });
    }

    passkeyRegister() {
        return new Promise((resolve, reject) => {
            if (this.isLoggedIn() === false || !('credentials' in navigator)) {
                reject();
                return;
            }
            this.addLoadingState('logging-in');
            fetch(this.config.auth_server + '/passkey-register-options', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Authorization: 'Bearer ' + helpers.cookieGet('access_token')
                },
                cache: 'no-cache'
            })
                .then(res => res.json())
                .catch(error => error)
                .then(response => {
                    if (response === undefined || response === null || response.success !== true) {
                        this.removeLoadingStates();
                        reject(response);
                        return;
                    }
                    let publicKey = this.passkeyPublicKeyFromJson(response.data.publicKey);
                    navigator.credentials
                        .create({ publicKey: publicKey })
                        .then(credential => {
                            if (credential === null) {
                                this.removeLoadingStates();
                                reject();
                                return;
                            }
                            fetch(this.config.auth_server + '/passkey-register', {
                                method: 'POST',
                                body: JSON.stringify({ credential: this.passkeyCredentialToJson(credential) }),
                                headers: {
                                    'content-type': 'application/json',
                                    Authorization: 'Bearer ' + helpers.cookieGet('access_token')
                                },
                                cache: 'no-cache'
                            })
                                .then(res => res.json())
                                .catch(error => error)
                                .then(response => {
                                    this.removeLoadingStates();
                                    if (response !== undefined && response !== null && response.success === true) {
                                        resolve(response);
                                    } else {
                                        reject(response);
                                    }
                                });
                        })
                        .catch(error => {
                            this.removeLoadingStates();
                            reject(error);
                        });
                });
        });
    }

    passkeyDelete(id) {
        return new Promise((resolve, reject) => {
            if (this.isLoggedIn() === false) {
                reject();
                return;
            }
            this.addLoadingState('logging-in');
            fetch(this.config.auth_server + '/passkey-delete', {
                method: 'POST',
                body: JSON.stringify({ id: id }),
                headers: {
                    'content-type': 'application/json',
                    Authorization: 'Bearer ' + helpers.cookieGet('access_token')
                },
                cache: 'no-cache'
            })
                .then(res => res.json())
                .catch(error => error)
                .then(response => {
                    this.removeLoadingStates();
                    if (response !== undefined && response !== null && response.success === true) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                });
        });
    }

    passkeyLogin(login = null) {
        return new Promise((resolve, reject) => {
            if (!('credentials' in navigator)) {
                reject();
                return;
            }
            this.addLoadingState('logging-in');
            let body = {};
            if (login !== null && login !== '') {
                body[this.config.auth_login] = login;
            }
            fetch(this.config.auth_server + '/passkey-login-options', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'content-type': 'application/json' },
                cache: 'no-cache'
            })
                .then(res => res.json())
                .catch(error => error)
                .then(response => {
                    if (response === undefined || response === null || response.success !== true) {
                        this.removeLoadingStates();
                        reject(response);
                        return;
                    }
                    let publicKey = this.passkeyPublicKeyFromJson(response.data.publicKey);
                    navigator.credentials
                        .get({ publicKey: publicKey })
                        .then(credential => {
                            if (credential === null) {
                                this.removeLoadingStates();
                                reject();
                                return;
                            }
                            fetch(this.config.auth_server + '/passkey-login', {
                                method: 'POST',
                                body: JSON.stringify({ credential: this.passkeyCredentialToJson(credential) }),
                                headers: { 'content-type': 'application/json' },
                                cache: 'no-cache'
                            })
                                .then(res => res.json())
                                .catch(error => error)
                                .then(response => {
                                    if (response !== undefined && response !== null && response.success === true) {
                                        this.setCookies(response.data.access_token)
                                            .then(() => {
                                                this.removeLoadingStates();
                                                resolve(response);
                                            })
                                            .catch(error => {
                                                this.removeLoadingStates();
                                                reject(error);
                                            });
                                    } else {
                                        this.removeLoadingStates();
                                        reject(response);
                                    }
                                });
                        })
                        .catch(error => {
                            this.removeLoadingStates();
                            reject(error);
                        });
                });
        });
    }

    login() {
        return new Promise((resolve, reject) => {
            if (helpers.cookieGet('access_token') !== null) {
                this.addLoadingState('logging-in');
                fetch(this.config.auth_server + '/check', {
                    method: 'POST',
                    body: JSON.stringify({ access_token: helpers.cookieGet('access_token') }),
                    headers: { 'content-type': 'application/json' },
                    cache: 'no-cache'
                })
                    .then(res => res.json())
                    .catch(err => err)
                    .then(response => {
                        if (response.success === true) {
                            this.setCookies(helpers.cookieGet('access_token'))
                                .then(() => {
                                    this.removeLoadingStates();
                                    resolve();
                                })
                                .catch(error => {
                                    reject(error);
                                });
                        } else {
                            fetch(this.config.auth_server + '/refresh', {
                                method: 'POST',
                                headers: {
                                    'content-type': 'application/json',
                                    Authorization: 'Bearer ' + helpers.cookieGet('access_token')
                                },
                                cache: 'no-cache'
                            })
                                .then(res => res.json())
                                .catch(err => err)
                                .then(response => {
                                    if (response.success === true) {
                                        this.setCookies(response.data.access_token)
                                            .then(() => {
                                                this.removeLoadingStates();
                                                resolve();
                                            })
                                            .catch(error => {
                                                reject(error);
                                            });
                                    } else {
                                        this.renderLoginFormWithPromise().then(() => {
                                            resolve();
                                        });
                                    }
                                });
                        }
                    });
            } else {
                this.renderLoginFormWithPromise()
                    .then(() => {
                        resolve();
                    })
                    .catch(() => {
                        reject();
                    });
            }
        });
    }

    fetch(url, args = {}) {
        return new Promise((resolve, reject) => {
            if (!('headers' in args)) {
                args.headers = {};
            }
            if (!('tries' in args)) {
                args.tries = 0;
            }

            args.tries++;

            if (args.tries > 3) {
                reject(null);
                return;
            } else if (this.isLoggedIn() === false) {
                this.login()
                    .then(() => {
                        this.fetch(url, args)
                            .then(response => {
                                resolve(response);
                            })
                            .catch(error => {
                                reject(error);
                            });
                    })
                    .catch(error => {
                        reject(error);
                    });
            } else {
                this.addLoadingState('fetching');
                args.headers.Authorization = 'Bearer ' + helpers.cookieGet('access_token');
                fetch(url, args)
                    .then(v => v)
                    .catch(v => v)
                    .then(response => {
                        this.removeLoadingStates();
                        if (response.status === 401) {
                            this.addLoadingState('logging-in');
                            fetch(this.config.auth_server + '/refresh', {
                                method: 'POST',
                                headers: {
                                    'content-type': 'application/json',
                                    Authorization: 'Bearer ' + helpers.cookieGet('access_token')
                                },
                                cache: 'no-cache'
                            })
                                .then(res => res.json())
                                .catch(error => error)
                                .then(response => {
                                    if (response.success === true) {
                                        this.setCookies(response.data.access_token)
                                            .then(() => {
                                                this.removeLoadingStates();
                                                this.fetch(url, args)
                                                    .then(response => {
                                                        resolve(response);
                                                    })
                                                    .catch(error => {
                                                        reject(error);
                                                    });
                                            })
                                            .catch(error => {
                                                this.removeLoadingStates();
                                                reject(error);
                                            });
                                    } else {
                                        this.removeLoadingStates();
                                        this.renderLoginFormWithPromise()
                                            .then(() => {
                                                this.fetch(url, args)
                                                    .then(response => {
                                                        resolve(response);
                                                    })
                                                    .catch(error => {
                                                        reject(error);
                                                    });
                                            })
                                            .catch(error => {
                                                reject(error);
                                            });
                                    }
                                });
                        } else {
                            resolve(response);
                        }
                    });
            }
        });
    }

    setCookies(access_token = null) {
        return new Promise((resolve, reject) => {
            if (this.setCookieLoading === undefined) {
                this.setCookieLoading === false;
            }
            if (this.setCookieLoading === true) {
                resolve();
                return;
            }
            this.setCookieLoading = true;

            if (access_token !== null) {
                helpers.cookieSet('access_token', access_token, 28);
            } else {
                helpers.cookieDelete('access_token');
            }

            if (
                this.config.sso === undefined ||
                (this.config.sso.length === 1 &&
                    this.config.sso[0] === window.location.protocol + '//' + window.location.host)
            ) {
                this.setCookieLoading = false;
                resolve();
                return;
            }

            helpers.remove(document.querySelector('.iframe_wrapper'));
            let iframe_wrapper = document.createElement('div');
            iframe_wrapper.setAttribute('class', 'iframe_wrapper');
            iframe_wrapper.style.position = 'absolute';
            iframe_wrapper.style.opacity = '0';
            document.body.appendChild(iframe_wrapper);

            let timeout = null;

            let _this = this,
                todo = this.config.sso.length - 1,
                waitForPostMessage = function (e) {
                    if (_this.config.sso.indexOf(e.origin) === -1) {
                        return;
                    }
                    if (e.data !== undefined && e.data !== null && 'success' in e.data && e.data.success === true) {
                        todo--;
                    }
                    //console.log(todo);
                    if (todo <= 0) {
                        if (timeout) {
                            //console.log('cleared timeout');
                            clearTimeout(timeout);
                        }
                        window.removeEventListener('message', waitForPostMessage, false);
                        helpers.remove(document.querySelector('.iframe_wrapper'));
                        _this.setCookieLoading = false;
                        resolve();
                    }
                };
            window.addEventListener('message', waitForPostMessage, false);
            timeout = setTimeout(() => {
                if (this.setCookieLoading === true) {
                    //console.log('timeout');
                    window.removeEventListener('message', waitForPostMessage, false);
                    helpers.remove(document.querySelector('.iframe_wrapper'));
                    this.setCookieLoading = false;
                    resolve();
                }
            }, 20000);
            this.config.sso.forEach(sso__value => {
                if (sso__value === window.location.protocol + '//' + window.location.host) {
                    return;
                }
                let iframe = document.createElement('iframe');
                iframe.setAttribute('src', sso__value + '/sso.html');
                iframe.style.width = '1px';
                iframe.style.height = '1px';
                iframe.addEventListener('load', e => {
                    iframe.contentWindow.postMessage(
                        {
                            access_token: access_token
                        },
                        sso__value
                    );
                });
                document.querySelector('.iframe_wrapper').appendChild(iframe);
            });
        });
    }

    renderLoginFormWithPromise() {
        return new Promise((resolve, reject) => {
            this.buildUpLoginFormHtml();
            this.bindLoginFormSubmit()
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
            this.captchaRender()
                .then(() => {
                    let form = document.querySelector('.' + this.config.login_form_class + ' form');
                    let submit = form?.querySelector('button[type="submit"], input[type="submit"]');
                    if (submit !== null && submit !== undefined) {
                        submit.disabled = false;
                        submit.removeAttribute('aria-busy');
                    }
                    this.triggerLoginFormRenderedEvent();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    buildUpLoginFormHtml() {
        if (!('login_form' in this.config) || this.config.login_form == '') {
            this.config.login_form = `<div class="login-form">
                <div class="login-form__inner">
                    <form class="login-form__form">
                        <ul class="login-form__items">
                            <li class="login-form__item">
                                <label class="login-form__label login-form__label--${
                                    this.config.auth_login
                                }" for="login-form__label--${this.config.auth_login}">${
                                    this.config.auth_login === 'email'
                                        ? 'E-Mail-Adresse'
                                        : this.config.auth_login === 'username'
                                          ? 'Benutzername'
                                          : this.config.auth_login
                                }</label>
                                <input class="login-form__input login-form__input--${
                                    this.config.auth_login
                                }" id="login-form__label--${
                                    this.config.auth_login
                                }" type="text" required="required" autocomplete="${
                                    this.config.auth_login
                                }" name="${this.config.auth_login}" />
                            </li>
                            <li class="login-form__item">
                                <label class="login-form__label login-form__label--password" for="login-form__label--password">Passwort</label>
                                <input class="login-form__input login-form__input--password" id="login-form__label--password" type="password" required="required" autocomplete="current-password" name="password" />
                            </li>
                            ${
                                this.captchaEnabled()
                                    ? `<li class="login-form__item">
                                <div class="login-form__captcha"></div>
                            </li>`
                                    : ''
                            }
                            <li class="login-form__item">
                                <input class="login-form__submit" type="submit" value="Anmelden" />
                            </li>
                            ${
                                this.passkeyEnabled()
                                    ? `<li class="login-form__item">
                                <button class="login-form__passkey" type="button">Mit Passkey anmelden</button>
                            </li>`
                                    : ''
                            }
                        </ul>
                    </form>
                </div>
            </div>`;
        }
        let dom = new DOMParser().parseFromString(this.config.login_form, 'text/html').body.childNodes[0];
        this.config.login_form_class = dom.getAttribute('class').split(' ')[0];
        let submit = dom.querySelector('button[type="submit"], input[type="submit"]');
        if (this.captchaEnabled() && submit !== null) {
            submit.disabled = true;
            submit.setAttribute('aria-busy', 'true');
        }
        let submitItem =
            submit !== null
                ? submit.closest('.' + this.config.login_form_class + '__item') ||
                  submit.closest('li') ||
                  submit.parentElement
                : null;
        let itemTag = submitItem !== null && submitItem.tagName.toLowerCase() === 'li' ? 'li' : 'div';
        if (this.captchaEnabled() && dom.querySelector('.' + this.config.login_form_class + '__captcha') === null) {
            if (submitItem !== null) {
                submitItem.insertAdjacentHTML(
                    'beforebegin',
                    '<' +
                        itemTag +
                        ' class="' +
                        this.config.login_form_class +
                        '__item"><div class="' +
                        this.config.login_form_class +
                        '__captcha"></div></' +
                        itemTag +
                        '>'
                );
            }
        }
        if (this.passkeyEnabled() && dom.querySelector('.' + this.config.login_form_class + '__passkey') === null) {
            if (submitItem !== null) {
                submitItem.insertAdjacentHTML(
                    'afterend',
                    '<' +
                        itemTag +
                        ' class="' +
                        this.config.login_form_class +
                        '__item"><button class="' +
                        this.config.login_form_class +
                        '__passkey" type="button">Mit Passkey anmelden</button></' +
                        itemTag +
                        '>'
                );
            }
        }
        helpers.remove(document.querySelector('.' + this.config.login_form_class));
        this.addLoadingState('login-form-visible');
        let parent = document.body;
        if (
            'login_form_parent' in this.config &&
            this.config.login_form_parent != '' &&
            document.querySelector(this.config.login_form_parent) !== null
        ) {
            parent = document.querySelector(this.config.login_form_parent);
        }
        parent.appendChild(dom);
    }

    triggerLoginFormRenderedEvent() {
        if (
            'login_form_rendered' in this.config &&
            this.config.login_form_rendered != '' &&
            typeof this.config.login_form_rendered === 'function'
        ) {
            this.config.login_form_rendered(document.querySelector('.' + this.config.login_form_class));
        }
    }

    captchaEnabled() {
        return (
            this.config.captcha !== false &&
            typeof this.config.captcha === 'object' &&
            (!('provider' in this.config.captcha) || this.captchaProvider() in this.captchaVendors()) &&
            'sitekey' in this.config.captcha &&
            this.config.captcha.sitekey !== ''
        );
    }

    captchaProvider() {
        return (this.config.captcha && this.config.captcha.provider) || 'hcaptcha';
    }

    captchaVendors() {
        return {
            hcaptcha: {
                script: 'https://js.hcaptcha.com/1/api.js?render=explicit',
                langKey: 'hl',
                field: 'h-captcha-response'
            },
            turnstile: {
                script: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
                langKey: 'language',
                field: 'cf-turnstile-response'
            }
        };
    }

    captchaVendor() {
        return this.captchaVendors()[this.captchaProvider()] || this.captchaVendors().hcaptcha;
    }

    captchaApi() {
        return window[this.captchaProvider()];
    }

    passkeyEnabled() {
        return this.config.passkeys !== false;
    }

    responseMessage(response) {
        let messages = {
            en: {
                _default: 'Not successful',
                'unknown route': 'Unknown route!',
                'captcha not successful': 'Captcha not successful',
                'too many login attempts': 'Too many login attempts. Please try again later.',
                'auth successful': 'Successfully logged in',
                'auth not successful': 'Not successful',
                'invalid token': 'Invalid token',
                'logout successful': 'Successfully logged out',
                'logout not successful': 'Logout not successful',
                'valid token': 'Valid token',
                'passkey registration options created': 'Passkey registration prepared',
                'passkey registration options not created': 'Passkey registration not prepared',
                'passkey registered': 'Passkey registered',
                'passkey not registered': 'Passkey not registered',
                'passkey login options created': 'Passkey login prepared',
                'passkey login options not created': 'Passkey login not prepared',
                'passkey auth not successful': 'Passkey not successful',
                'passkey deleted': 'Passkey deleted',
                'passkey not deleted': 'Passkey not deleted'
            },
            de: {
                _default: 'Nicht erfolgreich',
                'unknown route': 'Unbekannte Route!',
                'captcha not successful': 'Captcha nicht erfolgreich',
                'too many login attempts': 'Zu viele Loginversuche. Bitte später erneut versuchen.',
                'auth successful': 'Erfolgreich eingeloggt',
                'auth not successful': 'Nicht erfolgreich',
                'invalid token': 'Falsches Token',
                'logout successful': 'Erfolgreich ausgeloggt',
                'logout not successful': 'Nicht erfolgreich ausgeloggt',
                'valid token': 'Korrektes Token',
                'passkey registration options created': 'Passkey-Registrierung vorbereitet',
                'passkey registration options not created': 'Passkey-Registrierung nicht vorbereitet',
                'passkey registered': 'Passkey registriert',
                'passkey not registered': 'Passkey nicht registriert',
                'passkey login options created': 'Passkey-Login vorbereitet',
                'passkey login options not created': 'Passkey-Login nicht vorbereitet',
                'passkey auth not successful': 'Passkey nicht erfolgreich',
                'passkey deleted': 'Passkey gelöscht',
                'passkey not deleted': 'Passkey nicht gelöscht'
            }
        };
        let language = this.config.language in messages ? this.config.language : 'en';
        if (
            response !== undefined &&
            response !== null &&
            'message' in response &&
            response.message in messages[language]
        ) {
            return messages[language][response.message];
        }
        if (response !== undefined && response !== null && 'public_message' in response) {
            return response.public_message;
        }
        return messages[language]._default;
    }

    captchaRender() {
        return new Promise((resolve, reject) => {
            if (!this.captchaEnabled()) {
                resolve();
                return;
            }
            this.captchaLoad()
                .then(() => {
                    let captcha = document.querySelector('.' + this.config.login_form_class + '__captcha');
                    if (captcha === null) {
                        resolve();
                        return;
                    }
                    if (captcha.getAttribute('data-widget-id') !== null) {
                        resolve();
                        return;
                    }
                    let options = {
                        sitekey: this.config.captcha.sitekey,
                        theme: this.config.captcha.theme || 'light'
                    };
                    if (this.config.language !== '') {
                        options[this.captchaVendor().langKey] = this.config.language;
                    }
                    captcha.setAttribute('data-widget-id', this.captchaApi().render(captcha, options));
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    captchaLoad() {
        return new Promise((resolve, reject) => {
            if (!this.captchaEnabled() || this.captchaProvider() in window) {
                resolve();
                return;
            }
            let selector = 'script[data-jwtbutler-captcha="' + this.captchaProvider() + '"]';
            if (document.querySelector(selector) !== null) {
                document.querySelector(selector).addEventListener('load', () => resolve());
                document.querySelector(selector).addEventListener('error', error => reject(error));
                return;
            }
            let script = document.createElement('script');
            script.setAttribute('src', this.captchaVendor().script);
            script.setAttribute('async', 'async');
            script.setAttribute('defer', 'defer');
            script.setAttribute('data-jwtbutler-captcha', this.captchaProvider());
            script.addEventListener('load', () => resolve());
            script.addEventListener('error', error => reject(error));
            document.head.appendChild(script);
        });
    }

    captchaToken(form) {
        return new Promise((resolve, reject) => {
            if (!this.captchaEnabled()) {
                resolve(null);
                return;
            }
            let captcha = form.querySelector('.' + this.config.login_form_class + '__captcha');
            if (captcha === null || !(this.captchaProvider() in window)) {
                reject({ message: 'captcha not successful', public_message: 'Captcha not successful' });
                return;
            }
            let token = this.captchaApi().getResponse(captcha.getAttribute('data-widget-id'));
            if (token === '') {
                reject({ message: 'captcha not successful', public_message: 'Captcha not successful' });
                return;
            }
            resolve(token);
        });
    }

    captchaReset(form) {
        if (!this.captchaEnabled() || !(this.captchaProvider() in window)) {
            return;
        }
        let captcha = form.querySelector('.' + this.config.login_form_class + '__captcha');
        if (captcha === null || captcha.getAttribute('data-widget-id') === null) {
            return;
        }
        this.captchaApi().reset(captcha.getAttribute('data-widget-id'));
    }

    bindLoginFormSubmit() {
        return new Promise((resolve, reject) => {
            let dom = document.querySelector('.' + this.config.login_form_class),
                form = dom.querySelector('form');
            form.addEventListener(
                'submit',
                e => {
                    let submit = form.querySelector('button[type="submit"], input[type="submit"]');
                    if (submit?.getAttribute('aria-busy') === 'true') {
                        e.preventDefault();
                        return;
                    }
                    this.addLoadingState('logging-in');
                    if (submit !== null) {
                        submit.disabled = true;
                    }
                    helpers.remove(dom.querySelector('.' + this.config.login_form_class + '__error'));
                    let body = {
                        [this.config.auth_login]: form.querySelector('input[name="' + this.config.auth_login + '"]')
                            .value,
                        password: form.querySelector('input[name="password"]').value
                    };
                    this.captchaToken(form)
                        .then(captchaToken => {
                            if (captchaToken !== null) {
                                body[this.captchaVendor().field] = captchaToken;
                            }
                            return fetch(this.config.auth_server + '/login', {
                                method: 'POST',
                                body: JSON.stringify(body),
                                headers: { 'content-type': 'application/json' },
                                cache: 'no-cache'
                            });
                        })
                        .then(res => res.json())
                        .catch(error => error)
                        .then(response => {
                            if (submit !== null) {
                                submit.disabled = false;
                            }
                            if (
                                response !== undefined &&
                                response !== null &&
                                'success' in response &&
                                response.success === true
                            ) {
                                helpers.remove(document.querySelector('.' + this.config.login_form_class));
                                this.setCookies(response.data.access_token)
                                    .then(() => {
                                        this.removeLoadingStates();
                                        resolve();
                                    })
                                    .catch(error => {
                                        reject(error);
                                    });
                            } else {
                                this.removeLoadingStates();
                                this.addLoadingState('login-form-visible');
                                this.captchaReset(form);
                                form.insertAdjacentHTML(
                                    'afterbegin',
                                    '<div class="' +
                                        this.config.login_form_class +
                                        '__error">' +
                                        this.responseMessage(response) +
                                        '</div>'
                                );
                            }
                        });
                    e.preventDefault();
                },
                false
            );
            if (form.querySelector('.' + this.config.login_form_class + '__passkey') !== null) {
                form.querySelector('.' + this.config.login_form_class + '__passkey').addEventListener(
                    'click',
                    e => {
                        this.addLoadingState('logging-in');
                        helpers.remove(dom.querySelector('.' + this.config.login_form_class + '__error'));
                        let login = null;
                        if (form.querySelector('input[name="' + this.config.auth_login + '"]') !== null) {
                            login = form.querySelector('input[name="' + this.config.auth_login + '"]').value;
                        }
                        this.passkeyLogin(login)
                            .then(() => {
                                helpers.remove(document.querySelector('.' + this.config.login_form_class));
                                this.removeLoadingStates();
                                resolve();
                            })
                            .catch(response => {
                                this.removeLoadingStates();
                                this.addLoadingState('login-form-visible');
                                form.insertAdjacentHTML(
                                    'afterbegin',
                                    '<div class="' +
                                        this.config.login_form_class +
                                        '__error">' +
                                        this.responseMessage(response) +
                                        '</div>'
                                );
                            });
                        e.preventDefault();
                    },
                    false
                );
            }
        });
    }

    passkeyPublicKeyFromJson(publicKey) {
        publicKey.challenge = this.passkeyBase64UrlToBuffer(publicKey.challenge);
        if ('user' in publicKey && 'id' in publicKey.user) {
            publicKey.user.id = this.passkeyBase64UrlToBuffer(publicKey.user.id);
        }
        if ('excludeCredentials' in publicKey) {
            publicKey.excludeCredentials.forEach(credential => {
                credential.id = this.passkeyBase64UrlToBuffer(credential.id);
            });
        }
        if ('allowCredentials' in publicKey) {
            publicKey.allowCredentials.forEach(credential => {
                credential.id = this.passkeyBase64UrlToBuffer(credential.id);
            });
        }
        return publicKey;
    }

    passkeyCredentialToJson(credential) {
        let response = {
            clientDataJSON: this.passkeyBufferToBase64Url(credential.response.clientDataJSON)
        };
        if ('attestationObject' in credential.response) {
            response.attestationObject = this.passkeyBufferToBase64Url(credential.response.attestationObject);
            if (typeof credential.response.getTransports === 'function') {
                response.transports = credential.response.getTransports();
            }
        }
        if ('authenticatorData' in credential.response) {
            response.authenticatorData = this.passkeyBufferToBase64Url(credential.response.authenticatorData);
            response.signature = this.passkeyBufferToBase64Url(credential.response.signature);
            response.userHandle =
                !('userHandle' in credential.response) || credential.response.userHandle === null
                    ? null
                    : this.passkeyBufferToBase64Url(credential.response.userHandle);
        }
        return {
            id: credential.id,
            rawId: this.passkeyBufferToBase64Url(credential.rawId),
            type: credential.type,
            response: response,
            clientExtensionResults: credential.getClientExtensionResults()
        };
    }

    passkeyBase64UrlToBuffer(value) {
        let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }
        let binary = atob(base64),
            bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    passkeyBufferToBase64Url(buffer) {
        let binary = '',
            bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }

    addLoadingState(state) {
        document.documentElement.classList.add('jwtbutler-' + state);
        if (state === 'logging-in' || state === 'logging-out') {
            document.documentElement.classList.add('jwtbutler-loading');
        }
    }

    removeLoadingStates() {
        document.documentElement.classList.remove('jwtbutler-logging-in');
        document.documentElement.classList.remove('jwtbutler-logging-out');
        document.documentElement.classList.remove('jwtbutler-loading');
        document.documentElement.classList.remove('jwtbutler-fetching');
        document.documentElement.classList.remove('jwtbutler-login-form-visible');
    }
}

if (typeof window !== 'undefined') {
    window.jwtbutler = jwtbutler;
}
