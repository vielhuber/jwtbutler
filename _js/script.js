import hlp from 'hlp';
export default class ssohelper
{

    constructor(config)
    {
        this.config = config;
    }

    getPayload()
    {
        if( hlp.cookieGet('access_token') === null )
        {
            return null;
        }
        try
        {
          return JSON.parse(atob(hlp.cookieGet('access_token').split('.')[1]));
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
        if( this.isLoggedIn() === false )
        {
            login().then(() =>
            {
                this.fetch(url, args);
            });
        }
        
        else
        {
            if( !('headers' in args) ) { args.headers = {}; }
            args.headers.Authorization = 'Bearer '+hlp.cookieGet('access_token');
            console.log(url);
            console.log(args);
            fetch(url, args).then((response) =>
            {
                if( response.status === 401 )
                {
                    // LOGIN funktion anzapfen(!)
                }
                else
                {
                    // this returns a promise
                    return response.json();
                }
            }).catch((error) =>
            {
                console.error(error);
            });
        }
    }

    login()
    {
        return new Promise((resolve,reject) =>
        {
            
            // if access token is available
            if( hlp.cookieGet('access_token') !== null )
            {
                // make a server side check
                fetch(
                    this.config.auth_server+'/check',
                    {
                        method: 'POST',
                        body: JSON.stringify({ access_token: hlp.cookieGet('access_token') }),
                        headers: { 'content-type': 'application/json' },
                        cache: 'no-cache'
                    }
                ).then(res => res.json()).catch(err => {}).then(response =>
                {
                    if( response.success === true )
                    {
                        this.setCookies( hlp.cookieGet('access_token') );
                        resolve();
                    }
                    else
                    {
                        // try to refresh it
                        fetch(
                            this.config.auth_server+'/refresh',
                            {
                                method: 'POST',
                                headers: { 'content-type': 'application/json', 'Authorization': 'Bearer '+hlp.cookieGet('access_token') },
                                cache: 'no-cache'
                            }
                        ).then(res => res.json()).catch(err => {}).then(response =>
                        {
                            if( response.success === true )
                            {
                                this.setCookies( response.data.access_token );
                                resolve();
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

    setCookies(access_token)
    {
        hlp.cookieSet('access_token', access_token, 28);
        /*
        TODO:
        if user has enabled third party cookies
        pageA server sets new access token in cookie via iframes for all other pages (pageB, pageC)
        */
    }

    renderLoginFormWithPromise()
    {
        /*
        if submit:
        pageA gets back access token from auth server
        pageA sets cookie for oneself
        if user has enabled third party cookies
        pageA sets cookie via iframes for all other pages (pageB, pageC)
        */
        return new Promise((resolve,reject) =>
        {
            hlp.remove( document.querySelector('.login_form') );
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
                hlp.remove( form.querySelector('.login_form__error') );
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
                ).then(res => res.json()).catch(err => {}).then(response =>
                {
                    form.querySelector('.login_form__submit').disabled = false;
                    if( response.success === true ) 
                    {
                        hlp.remove( document.querySelector('.login_form') );
                        this.setCookies( response.data.access_token );
                        resolve();
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
        fetch(
            this.config.auth_server+'/logout',
            {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'Authorization': 'Bearer '+hlp.cookieGet('access_token') },
                cache: 'no-cache'
            }
        ).then(res => res.json()).catch(err => {}).then(response =>
        {
            hlp.cookieDelete('access_token');
            /*
            TODO:
            if user has enabled third party cookies
            pageA removes cookie via iframes for all other pages (pageB, pageC)
            */
        });
    }

}

window.ssohelper = ssohelper;