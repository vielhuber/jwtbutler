# 🗝️ jwtsso 🗝️

jwtsso is a helper library for setting up a single sign on with jwt in a multi domain environment in no time.

## features

- syncs cookies via iframes through postMessage
- works in js applications
- renders loginforms
- the auth server remains untouched
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
// this function renders a login form inside the given selector (only if needed) and logs in on all pages
jwtsso.renderLogin('.login-form__container');

// this function logs out on all pages
jwtsso.logout();

// check if logged in
if( jwtsso.isLoggedIn() ) { }

// get jwt data (user id)
jwtsso.getJWT()
jwtsso.getUserId()

// make ajax calls (access tokens are automatically refreshed if needed)
jwtsso.call('get', 'https://tld.com').then((data) => { }).catch((error) => { })
jwtsso.call('post', 'https://tld.com', { foo: 'bar' }).then((data) => { }).catch((error) => { })
jwtsso.call('post', 'https://tld.com', { foo: 'bar' }, { Bar: 'baz' }).then((data) => { }).catch((error) => { })
```