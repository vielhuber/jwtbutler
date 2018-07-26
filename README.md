# 🗝️ jwtbutler 🗝️

jwtbutler is a helper library for setting up a single sign on with jwt in a multi domain environment in no time.

## features

- works in all js applications
- renders a simple loginform if needed
- requires no code changes on the auth server
- has a fetch helper function for api calls that do all the heavy lifting (e.g. refreshing token, repeating calls) under the hood
- provides a fallback for clients that have third party cookies disabled
- includes a timeout for broken connections
- syncs cookies via iframes through postmessage
- works also without single sign on

## requirements

- a fully setup jwt auth server with the following routes
  - /login (email, password)
  - /logout
  - /refresh
  - /check (access_token)
- 401 response code on bad authentication

## installation

install the javascript module:
```bash
npm install jwtbutler
```
```js
import jwtbutler from 'jwtbutler';
```

you also can embed it in legacy applications like this:
```html
<script src="jwtbutler.js"></script>
```

now instantiate the object with the basic configuration:
```js
const api = new jwtbutler({
    auth_server: 'http://example-auth-server.local',
    login_form_parent: '#app'
});
```

### single sign on

if you want to use sso, add all pages to the configuration object:

```js
sso: [
    'http://example-auth-page1.local',
    'http://example-auth-page2.local',
    'http://example-auth-page3.local'
]
```
then deploy the helper file [sso.html](https://github.com/vielhuber/jwtbutler/blob/master/_dist/sso.html) in the root public directories of all pages that use single sign on. don't forget to fill out all origin page domains in line 7.


## usage

```js
// this function
// ...checks if the user is logged in
// ...tries to generate a new token if possible
// ...if nothing works, renders a login form inside document.body
// ...on submit logs the user in on all pages
api.login().then(() => { alert('logged in everywhere!'); })

// check if logged in
if( api.isLoggedIn() ) { }

// get jwt data
api.getPayload()
api.getUserId()

// make ajax calls via fetch
// access tokens are automatically refreshed if needed and the request then is called again
// if the user is not logged in and a new token cannot be generated,
// a login form is rendered and after a succesful login, the request is again repeated
// fetch has the same interface as the official javascript Fetch API
api.fetch('http://example-auth-page1.local/protected/')
api.fetch('http://example-auth-page2.local/protected/', {
    method: 'POST',
    body: JSON.stringify({ 'foo': 'bar' }),
    cache: 'no-cache',
    headers: { 'content-type': 'application/json' }
}).then(res => res.json()).catch(err => err).then(response => { console.log(response); })

// this function logs out on all pages
api.logout().then(() => { alert('logged out everywhere!'); })
```

## styling

use the following classes to style idle states:

- `html.jwtbutler-logging-in`
- `html.jwtbutler-logging-out`
- `html.jwtbutler-loading` (for logging in and out)
- `html.jwtbutler-fetching`
- `html.jwtbutler-login-form-visible`

to style the login form, use the class of the main container:

- `.login-form`

## backend validation

you can easily check inside a backend on another page via php, if the provided access token is valid without even contacting the auth server.

#### installation

```bash
composer require firebase/php-jwt
```

#### index.php
```php
require_once(__DIR__.'/vendor/autoload.php');
use \Firebase\JWT\JWT;

// cors
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if(@$_SERVER['REQUEST_METHOD'] == 'OPTIONS') { die(); }

try
{
    $user_id = JWT::decode(
        str_replace('Bearer ','',@$_SERVER['HTTP_AUTHORIZATION']), // access token
        'WM38tprPABEgkldbt2yTAgxf2CGstfr5', // secret key
        ['HS256']
    )->sub;
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $user_id,
            'foo' => 'bar'
        ]
    ]);
    die();
}
catch(Exception $e)
{
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'unauthorized',
        'public_message' => '...'
    ]);
    die();
}
```

#### .htaccess
```.htaccess
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]
```

## testing

setup the following vhosts:
- http://example-auth-server.local => jwt auth server
- http://example-auth-page1.local => _tests/page1
- http://example-auth-page2.local => _tests/page2
- http://example-auth-page3.local => _tests/page3

and then run the test:
```bash
gulp js-test
```

## pseudo code

- if pageX wants to check if user is logged in on client side (without a backend call)
    - pageX frontend checks if access_token is present in cookie and can be decoded (the token is not validated and it also can be expired)
        - if no, the user is considered to be logged out
        - if yes, the user is considered to be logged in
- if a logged in user makes an backend/api call on pageX
    - pageX frontend checks if access_token is present in cookie and can be decoded (the token is not validated and it also can be expired)
        - if no, the user is considered to be not logged in
            - see login procedure
            - the call is repeated automatically after a succesful login
        - if yes, the user is considered to be logged in
            - the user sets the access_token in the header ("Bearer")
            - pageX backend validates the access token with the secret key
                - if the validation is ok
                    - the backend extracts the user id from the token and uses that to provide data
                    - the final response is served to the client
                - if the validation is not ok
                    - an error is served to the client
                    - the client tries to generate a new token from the old one
                        - if that was successful
                            - pageX sets cookie for oneself
                            - if user has enabled third party cookies                            
                                - pageX server sets new access token in cookie via iframes for all other pages
                            - the call will be repeated automatically
                        - if that was not successful
                            - see login procedure
                            - the call is repeated automatically after a succesful login
- login procedure
    - pageX frontend verifies the access_token via secret_key via the /check route
        - if available and not expired
            - pageX sets cookie for oneself
            - if user has enabled third party cookies
                - pageX server sets new access token in cookie via iframes for all other pages
        - if available and expired
            - pageX frontend tries to generate a new token from old token via the /refresh route
                - if it worked
                    - pageX sets cookie for oneself
                    - if user has enabled third party cookies                
                        - pageX server sets new access token in cookie via iframes for all other pages
                - if it didn't work
                    - render login form
        - if not available
            - render login form
- if the user submits the rendered login form on pageX
    - pageX gets back access token from auth server
    - pageX sets cookie for oneself
    - if user has enabled third party cookies
        - pageX sets cookie via iframes for all other pages
- if the user calls the logout function on pageX
    - pageX calls auth server to logout (this invalidates the token on the server side)
    - pageX removes cookie for oneself
    - if user has enabled third party cookies
        - pageX removes cookie via iframes for all other pages