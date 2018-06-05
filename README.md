# 🗝️ jwtsso 🗝️

jwtsso is a helper library for setting up a single sign on with jwt in a multi domain environment in no time.

## features

- syncs cookies via iframes through postMessage
- works in php applications
- works in js applications
- renders loginforms
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

 and deploy it together with [jwtsso.html](https://github.com/vielhuber/jwtsso/blob/master/jwtsso.html) in the root public directory on the auth server and on all pages that use sso.

### to use the jwtsso in php:
```bash
composer require vielhuber/jwtsso
```
```php
require __DIR__.'/vendor/autoload.php';
use vielhuber\jwtsso\jwtsso;
$jwtsso = new jwtsso;
```

### to use the jwtsso in js:
```bash
npm install jwtsso
```
```js
import jwtsso from 'jwtsso';
```

## usage

### on the auth server (php)
```php
// this renders a login form if needed and logs in on all pages
$jwtsso->handleLogin();

// logs out on all pages
$jwtsso->handleLogout();
```

### on the pages (js)
```js
// check if logged in
if( jwtsso.isLoggedIn() ) { }

// get jwt data (user id)
jwtsso.getJWT()

// redirect to login route
jwtsso.redirectToLogin()

// redirect to logout route
jwtsso.redirectToLogout()

// make ajax calls (access tokens are automatically refreshed if needed)
jwtsso.call('get', 'https://tld.com').then((data) => { }).catch((error) => { })
jwtsso.call('post', 'https://tld.com', { foo: 'bar' }).then((data) => { }).catch((error) => { })
jwtsso.call('post', 'https://tld.com', { foo: 'bar' }, { Bar: 'baz' }).then((data) => { }).catch((error) => { })
```

### on the pages (php)
```php
$jwtsso = new jwtsso;

// check if logged in
if( $jwtsso->isLoggedIn() ) { }

// get jwt data (user id)
$jwtsso->getJWT()

// redirect to login route
$jwtsso->redirectToLogin()

// redirect to logout route
$jwtsso->redirectToLogout()

// via php we also can validate the access token (with the secret key)
if( $jwtsso->isValidJWT('secret_key') ) { }
```