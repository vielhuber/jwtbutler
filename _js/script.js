import hlp from 'hlp';
export default class ssohelper
{

    constructor(config)
    {
        this.config = config;
    }

    isLoggedIn()
    {
        return this.config;
        return true;
        /*
            pageA frontend checks if access_token is present in cookie and can be decoded (the token is not validated and it also can be expired)
            if no, the user is considered to be logged out
            if yes, the user is considered to be logged in
        */

    }

    getPayload()
    {
        return 42;
        // https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript/46188039#46188039
    }

    getUserId()
    {
        return 43;
        // getPayload -> user id
    }

    call(method = 'get', url, args, headers)
    {
        /*
        if a logged in user makes an backend/api call on pageA
        ...
        login procedure
        */
    }

    login()
    {
        // if access token is available, make a server side check
        if( hlp.cookieGet('access_token') !== null )
        {
            hlp.post(
                this.config.auth_server+'/check',
                { access_token: hlp.cookieGet('access_token') }
            ).then((data) =>
            {
                console.log(data);
            }).catch((error) =>
            {
                console.log(error);
            })

            // if available and not expired
            if(1==1)
            {
                
            }
            // if available and expired
            if(1==1)
            {
                this.renderLoginForm();
            }
        }

        // if not available
        else
        {
            this.renderLoginForm();
        }
        
    }

    renderLoginForm()
    {
        /*
        if submit:
        pageA gets back access token from auth server
        pageA sets cookie for oneself
        if user has enabled third party cookies
        pageA sets cookie via iframes for all other pages (pageB, pageC)
        */
    }

    logout()
    {
        console.log('logout');
        /*
        pageA removes cookie for oneself
        if user has enabled third party cookies
        pageA removes cookie via iframes for all other pages (pageB, pageC)
        */
    }

}

window.ssohelper = ssohelper;