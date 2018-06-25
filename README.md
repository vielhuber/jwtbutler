# 🗝️ ssohelper 🗝️

ssohelper is a helper library for setting up a single sign on with jwt in a multi domain environment in no time.

## features

- syncs cookies via iframes through postMessage
- works in js applications
- renders loginforms
- the auth server remains untouched
- has helper functions for api calls that do all the heavy lifting (e.g. refreshing token, repeating calls) under the hood
- provides a fallback for clients that have third party cookies disabled

## requirements

- a fully setup jwt auth server with the following routes
  - /login (email, password)
  - /logout
  - /refresh
  - /check (access_token)

## installation

create the configuration file **ssohelper.json**

```json
{
    "auth_server": "http://local.auth.example.de",
    "pages": [
        "http://example-auth-page1.local",
        "http://example-auth-page2.local",
        "http://example-auth-page3.local"
    ]
}
```

and deploy it together with [ssohelper.html](https://github.com/vielhuber/ssohelper/blob/master/_dist/ssohelper.html) in the root public directories of all pages that use sso.

then install the javascript module
```bash
npm install ssohelper
```
```js
import ssohelper from 'ssohelper';
```

## usage

```js
// check if logged in
if( ssohelper.isLoggedIn() ) { }

// get jwt data (user id)
ssohelper.getPayload()
ssohelper.getUserId()

// make ajax calls
// access tokens are automatically refreshed if needed and the request then is called again
// if the user is not logged in and a new token cannot be generated, renderLogin() is called and after a succesful login, the request is again repeated
ssohelper.call('get', 'http://example-auth-page1.local/protectedroute').then((data) => { }).catch((error) => { })
ssohelper.call('post', 'http://example-auth-page1.local/protectedroute', { foo: 'bar' }).then((data) => { }).catch((error) => { })
ssohelper.call('post', 'http://example-auth-page1.local/protectedroute', { foo: 'bar' }, { Bar: 'baz' }).then((data) => { }).catch((error) => { })

// this function renders a login form inside document.body (only if needed)
// on submit it logs in on all pages
ssohelper.renderLogin().then(() => { alert('logged in everywhere!'); })

// this function logs out on all pages
ssohelper.logout().then(() => { alert('logged out everywhere!'); })
```

## backend validation

you can easily check inside a backend on another page via php, if the provided access token is valid without even contacting the auth server:
```bash
composer require firebase/php-jwt
```
```php
require_once(__DIR__.'/vendor/autoload.php');
use \Firebase\JWT\JWT;
try
{
    $user_id = JWT::decode(
        str_replace('Bearer ','',@$_SERVER['HTTP_AUTHORIZATION']), // access token
        'WM38tprPABEgkldbt2yTAgxf2CGstfr5', // secret key
        ['HS256']
    )->sub;
    // this user is authenticated; fetch some data for him
    // ...
}
catch(Exception $e)
{
    die($e->getMessage());
}