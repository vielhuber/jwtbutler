import helpers from './_helpers';

export default class ssohelper
{

    constructor(config)
    {
        this.config = config;
    }

    getPayload()
    {
        if( helpers.cookieGet('access_token') === null )
        {
            return null;
        }
        try
        {
          return JSON.parse(atob(helpers.cookieGet('access_token').split('.')[1]));
        }
        catch(e)
        {
          return null;
        }
    }    
    
    isLoggedIn()
    {
        if( this.getPayload() === null )
        {
            return false;
        }
        return true;
    }
    
    getUserId()
    {
        let payload = this.getPayload();
        if( payload === null )
        {
            return null;
        }
        return payload.sub;
    }

    fetch(url, args = {})
    {
        return new Promise((resolve,reject) =>
        {

            if( !('tries' in args) )
            {
                args.tries = 0;
            }
            args.tries++;
            if( args.tries > 3 )
            {
                reject(null);
                return;
            }

            else if( this.isLoggedIn() === false )
            {
                this.login()
                    .then(() =>
                    {

                        this.fetch(url, args)
                            .then((response) => { resolve(response); })
                            .catch((error) => { reject(error); });
                    })
                    .catch((error) =>
                    {
                        reject(error);
                    });
            }
            
            else
            {
                if( !('headers' in args) ) { args.headers = {}; }
                args.headers.Authorization = 'Bearer '+helpers.cookieGet('access_token');
                fetch(url, args).then(v=>v).catch(v=>v).then((response) =>
                {
                    if( response.status === undefined || response.status === 401 )
                    {
                        // try to refresh it
                        fetch(
                            this.config.auth_server+'/refresh',
                            {
                                method: 'POST',
                                headers: { 'content-type': 'application/json', 'Authorization': 'Bearer '+helpers.cookieGet('access_token') },
                                cache: 'no-cache'
                            }
                        )
                        .then(res => res.json())
                        .catch(error => error)
                        .then(response =>
                        {
                            if( response.success === true )
                            {
                                this.setCookies( response.data.access_token )
                                    .then(() =>
                                    {

                                        this.fetch(url, args)
                                            .then((response) => { resolve(response); })
                                            .catch((error) => { reject(error); });

                                    })
                                    .catch((error) => { reject(error); });
                            }
                            else
                            {
                                this.renderLoginFormWithPromise()
                                    .then(() => 
                                    {
                                        this.fetch(url, args)
                                            .then((response) => { resolve(response); })
                                            .catch((error) => { reject(error); });
                                    })
                                    .catch((error) =>
                                    {
                                        reject(error);
                                    });
                            }
                        });
                    }
                    else
                    {
                        resolve(response);                        
                    }
                });
            }
        });
    }

    login()
    {
        return new Promise((resolve,reject) =>
        {
            
            // if access token is available
            if( helpers.cookieGet('access_token') !== null )
            {
                // make a server side check
                fetch(
                    this.config.auth_server+'/check',
                    {
                        method: 'POST',
                        body: JSON.stringify({ access_token: helpers.cookieGet('access_token') }),
                        headers: { 'content-type': 'application/json' },
                        cache: 'no-cache'
                    }
                ).then(res => res.json()).catch(err => err).then(response =>
                {
                    if( response.success === true )
                    {
                        this.setCookies( helpers.cookieGet('access_token') )
                            .then(() => { resolve(); })
                            .catch((error) => { reject(error); });
                    }
                    else
                    {
                        // try to refresh it
                        fetch(
                            this.config.auth_server+'/refresh',
                            {
                                method: 'POST',
                                headers: { 'content-type': 'application/json', 'Authorization': 'Bearer '+helpers.cookieGet('access_token') },
                                cache: 'no-cache'
                            }
                        ).then(res => res.json()).catch(err => err).then(response =>
                        {
                            if( response.success === true )
                            {
                                this.setCookies( response.data.access_token )
                                    .then(() => { resolve(); })
                                    .catch((error) => { reject(error); });
                            }
                            else
                            {
                                this.renderLoginFormWithPromise().then(() => 
                                {
                                    resolve();     
                                });
                            }
                        });
                    }
                });
            }

            // if not available
            else
            {
                this.renderLoginFormWithPromise().then(() => 
                {
                    resolve();     
                });
            }

        });
        
    }

    setCookies(access_token = null)
    {
        return new Promise((resolve) =>
        {
            if( this.setCookieLoading === undefined ) { this.setCookieLoading === false; }
            if( this.setCookieLoading === true ) { resolve(); return; }

            if( access_token !== null )
            {
                helpers.cookieSet('access_token', access_token, 28);
            }
            else
            {
                helpers.cookieDelete('access_token');
            }

            helpers.remove( document.querySelector('.iframe_wrapper') );
            let iframe_wrapper = document.createElement('div');
            iframe_wrapper.setAttribute('class','iframe_wrapper');
            iframe_wrapper.style.position = 'absolute';
            iframe_wrapper.style.opacity = '0';
            document.body.appendChild(iframe_wrapper);

            this.setCookieLoading = true;
            let todo = this.config.pages.length-1,
                _this = this,
                fn = function(e)
                {
                    if ( _this.config.pages.indexOf(e.origin) === -1 )
                    {
                        return;
                    }
                    if( e.data !== undefined && e.data !== null && ('success' in e.data) && e.data.success === true )
                    {
                        todo--;
                    }
                    console.log(todo);
                    if( todo <= 0 )
                    {
                        window.removeEventListener('message', fn, false);
                        helpers.remove( document.querySelector('.iframe_wrapper') );
                        _this.setCookieLoading = false;
                        resolve();
                    }
                };
            window.addEventListener('message', fn, false);
            setTimeout(() =>
            {
                if( this.setCookieLoading === true )
                {
                    console.log('timeout');
                    window.removeEventListener('message', fn, false);
                    helpers.remove( document.querySelector('.iframe_wrapper') );
                    this.setCookieLoading = false;
                    resolve();
                }
            },5000);
            this.config.pages.forEach((pages__value) =>
            {
                if( pages__value === window.location.protocol+'//'+window.location.host )
                {
                    return;
                }
                let iframe = document.createElement('iframe');        
                iframe.setAttribute('src', pages__value+'/ssohelper.html');
                iframe.style.width = '1px';
                iframe.style.height = '1px';
                iframe.addEventListener('load', (e) =>
                {
                    iframe.contentWindow.postMessage({
                        'access_token': access_token
                    }, pages__value);
                });
                document.querySelector('.iframe_wrapper').appendChild(iframe);            
            });

        });
    }

    renderLoginFormWithPromise()
    {
        return new Promise((resolve,reject) =>
        {
            helpers.remove( document.querySelector('.login_form') );
            let form = document.createElement('div');
            form.setAttribute('class','login_form');
            document.body.insertBefore(form, document.body.firstChild);
            form.insertAdjacentHTML('beforeend',`
                <div class="login_form__inner">
                    <form class="login_form__form">
                        <ul class="login_form__items">
                            <li class="login_form__item">
                                <label for="email">E-Mail-Adresse</label>
                                <input type="text" required="required" name="email" class="login_form__email" />
                            </li>
                            <li class="login_form__item">
                                <label for="password">Passwort</label>
                                <input type="password" required="required" name="password" class="login_form__password" />
                            </li>
                            <li class="login_form__item">
                                <input class="login_form__submit" type="submit" value="Anmelden" />
                            </li>
                        </ul>
                    </form>
                </div>
            `);
            form.addEventListener('submit', (e) =>
            {
                form.querySelector('.login_form__submit').disabled = true;
                helpers.remove( form.querySelector('.login_form__error') );
                fetch(
                    this.config.auth_server+'/login',
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            email: form.querySelector('.login_form__email').value,
                            password: form.querySelector('.login_form__password').value
                        }),
                        headers: { 'content-type': 'application/json' },
                        cache: 'no-cache'
                    }
                ).then(res => res.json()).catch(err => err).then(response =>
                {
                    form.querySelector('.login_form__submit').disabled = false;
                    if( response.success === true ) 
                    {
                        helpers.remove( document.querySelector('.login_form') );
                        this.setCookies( response.data.access_token )
                            .then(() => { resolve(); })
                            .catch((error) => { reject(error); });
                    }
                    else
                    {
                        form.querySelector('.login_form__inner').insertAdjacentHTML('afterbegin','<p class="login_form__error">'+response.public_message+'</p>');
                    }
                });                
                e.preventDefault();
            }, false);            
        });
    }

    logout()
    {
        return new Promise((resolve,reject) =>
            {
            fetch(
                this.config.auth_server+'/logout',
                {
                    method: 'POST',
                    headers: { 'content-type': 'application/json', 'Authorization': 'Bearer '+helpers.cookieGet('access_token') },
                    cache: 'no-cache'
                }
            ).then(res => res.json()).catch(err => err).then(response =>
            {
                this.setCookies( null )
                    .then(() => { resolve(); })
                    .catch((error) => { reject(error); });
            });
        });
    }

}

window.ssohelper = ssohelper;