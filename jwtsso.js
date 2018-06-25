class jwtsso
{

    isLoggedIn()
    {

        /*
            pageA frontend checks if access_token is present in cookie and can be decoded (the token is not validated and it also can be expired)
            if no, the user is considered to be logged out
            if yes, the user is considered to be logged in
        */

    }

    getPayload()
    {

    }

    getUserId()
    {
        
    }

    call(method = 'get', url)
    {
        /*
        if a logged in user makes an backend/api call on pageA
        ...
        login procedure
        */
    }

    renderLogin()
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
        /*
        pageA removes cookie for oneself
        if user has enabled third party cookies
        pageA removes cookie via iframes for all other pages (pageB, pageC)
        */
    }

}