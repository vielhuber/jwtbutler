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
  - /api/check (access_token)

## installation

create the configuration file **jwtsso.json**

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
jwtsso.call('get', 'http://example-auth-page1.local/protectedroute').then((data) => { }).catch((error) => { })
jwtsso.call('post', 'http://example-auth-page1.local/protectedroute', { foo: 'bar' }).then((data) => { }).catch((error) => { })
jwtsso.call('post', 'http://example-auth-page1.local/protectedroute', { foo: 'bar' }, { Bar: 'baz' }).then((data) => { }).catch((error) => { })

// this function renders a login form inside document.body (only if needed)
// on submit it logs in on all pages
jwtsso.renderLogin().then(() => { alert('logged in everywhere!'); })

// this function logs out on all pages
jwtsso.logout().then(() => { alert('logged out everywhere!'); })
```

## backend validation

you can easily check inside a backend on page 1/2/3 via php, if the provided access token is valid:
```bash
composer require firebase/php-jwt
```
```php
require_once(__DIR__.'/vendor/autoload.php');
use \Firebase\JWT\JWT;
$secret_key = 'WM38tprPABEgkldbt2yTAgxf2CGstfr5';
$access_token = str_replace('Bearer ','',@$_SERVER['HTTP_AUTHORIZATION']);
try
{
    $jwt = JWT::decode($access_token, $secret_key, ['HS256']);
    $user_id = $jwt->sub;
}
catch(Exception $e)
{
    http_response_code(401);
    echo json_encode([ 'success' => false, 'message' => $e->getMessage() ]);
    die();
}
http_response_code(200);
echo json_encode([ 'user_id' => $user_id ]);
die();