import 'babel-polyfill'; // use Array.includes etc. in IE11
import 'whatwg-fetch'; // use fetch
import helpers from './_helpers';

export default class jwtbutler {
    constructor(config) {
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
            console.log(access_token);

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
                waitForPostMessage = function(e) {
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
        });
    }

    buildUpLoginFormHtml() {
        if (!('login_form' in this.config) || this.config.login_form == '') {
            this.config.login_form = `<div class="login-form">
                <div class="login-form__inner">
                    <form class="login-form__form">
                        <ul class="login-form__items">
                            <li class="login-form__item">
                                <label class="login-form__label login-form__label--email" for="login-form__label--email">E-Mail-Adresse</label>
                                <input class="login-form__input login-form__input--email" id="login-form__label--email" type="text" required="required" name="email" />
                            </li>
                            <li class="login-form__item">
                                <label class="login-form__label login-form__label--password" for="login-form__label--password">Passwort</label>
                                <input class="login-form__input login-form__input--password" id="login-form__label--password" type="password" required="required" name="password" />
                            </li>
                            <li class="login-form__item">
                                <input class="login-form__submit" type="submit" value="Anmelden" />
                            </li>
                        </ul>
                    </form>
                </div>
            </div>`;
        }
        let dom = new DOMParser().parseFromString(this.config.login_form, 'text/html').body.childNodes[0];
        this.config.login_form_class = dom.getAttribute('class').split(' ')[0];
        helpers.remove(document.querySelector('.' + this.config.login_form_class));
        this.addLoadingState('login-form-visible');
        document.body.appendChild(dom);
    }

    bindLoginFormSubmit(form) {
        return new Promise((resolve, reject) => {
            let form = document.querySelector('.' + this.config.login_form_class);
            form.addEventListener(
                'submit',
                e => {
                    this.addLoadingState('logging-in');
                    if (form.querySelector('input[type="submit"]') !== null) {
                        form.querySelector('input[type="submit"]').disabled = true;
                    }
                    helpers.remove(form.querySelector('.' + this.config.login_form_class + '__error'));
                    fetch(this.config.auth_server + '/login', {
                        method: 'POST',
                        body: JSON.stringify({
                            email: form.querySelector('input[name="email"]').value,
                            password: form.querySelector('input[name="password"]').value
                        }),
                        headers: { 'content-type': 'application/json' },
                        cache: 'no-cache'
                    })
                        .then(res => res.json())
                        .catch(err => err)
                        .then(response => {
                            if (form.querySelector('input[type="submit"]') !== null) {
                                form.querySelector('input[type="submit"]').disabled = false;
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
                                form.querySelector('form').insertAdjacentHTML(
                                    'afterbegin',
                                    '<div class="' +
                                        this.config.login_form_class +
                                        '__error">' +
                                        response.public_message +
                                        '</div>'
                                );
                            }
                        });
                    e.preventDefault();
                },
                false
            );
        });
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

window.jwtbutler = jwtbutler;
