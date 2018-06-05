# 🗝️ jwtsso 🗝️

jwtsso is a helper library for setting up a single sign on with jwt in a multi domain environment in no time.

## features

- syncs cookies via iframes through postMessage
- works in js applications
- renders loginforms
- the auth server remains untouched
- has helper functions for api calls that does all heavy lifting under the hood
- provides a fallback for clients that have third party cookies disabled

## requirements

- a fully setup jwt auth server with the following routes
  - /api/login (email, password)
  - /api/logout
  - /api/refresh
  - /api/validate (access_token)

## installation

create the configuration file **jwtsso.json**

```json
{
    "auth_server": "local.auth.example.de",
    "pages": [
        "example-auth-page1.local",
        "example-auth-page2.local",
        "example-auth-page3.local"
    ]
}
```

and deploy it together with [jwtsso.html](https://github.com/vielhuber/jwtsso/blob/master/jwtsso.html) in the root public directories of all pages that use sso.

then install the javascript module
```bash
npm install jwtsso
```
```js
import jwtsso from 'jwtsso';
```

## usage

```js
// check if logged in
if( jwtsso.isLoggedIn() ) { }

// get jwt data (user id)
jwtsso.getPayload()
jwtsso.getUserId()

// make ajax calls
// access tokens are automatically refreshed if needed and the request then is called again
// if the user is not logged in and a new token cannot be generated, renderLogin() is called and after a succesful login, the request is again repeated
jwtsso.call('get', 'https://tld.com').then((data) => { }).catch((error) => { })
jwtsso.call('post', 'https://tld.com', { foo: 'bar' }).then((data) => { }).catch((error) => { })
jwtsso.call('post', 'https://tld.com', { foo: 'bar' }, { Bar: 'baz' }).then((data) => { }).catch((error) => { })

// this function renders a login form inside document.body (only if needed)
// on submit it logs in on all pages
jwtsso.renderLogin().then(() => { alert('logged in everywhere!'); })

// this function logs out on all pages
jwtsso.logout().then(() => { alert('logged out everywhere!'); })
```