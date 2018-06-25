<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1" />
    <script src="ssohelper.js"></script>
    <title>.</title>
    <script>
    document.addEventListener('DOMContentLoaded', function()
    {
        let ssohelper = new window.ssohelper({
            "auth_server": "http://example-auth-server.local",
            "pages": [
                "http://example-auth-page1.local",
                "http://example-auth-page2.local",
                "http://example-auth-page3.local"
            ]
        });
        
        document.querySelector('.isLoggedIn').addEventListener('click', (e) =>
        {
            console.log( ssohelper.isLoggedIn() );
            e.preventDefault();
        }, false);

        document.querySelector('.getPayload').addEventListener('click', (e) =>
        {
            console.log( ssohelper.getPayload() );
            e.preventDefault();
        }, false);

        document.querySelector('.getUserId').addEventListener('click', (e) =>
        {
            console.log( ssohelper.getUserId() );
            e.preventDefault();
        }, false);

        document.querySelector('.call1').addEventListener('click', (e) =>
        {
            ssohelper.call('get', 'http://example-auth-page1.local/protectedroute').then((data) => { }).catch((error) => { })
            e.preventDefault();
        }, false);

        document.querySelector('.call2').addEventListener('click', (e) =>
        {
            ssohelper.call('get', 'http://example-auth-page2.local/protectedroute').then((data) => { }).catch((error) => { })
            e.preventDefault();
        }, false);

        document.querySelector('.call3').addEventListener('click', (e) =>
        {
            ssohelper.call('get', 'http://example-auth-page3.local/protectedroute').then((data) => { }).catch((error) => { })
            e.preventDefault();
        }, false);

        document.querySelector('.login').addEventListener('click', (e) =>
        {
            ssohelper.login();
            e.preventDefault();
        }, false);

        document.querySelector('.logout').addEventListener('logout', (e) =>
        {
            console.log( ssohelper.logout() );
            e.preventDefault();
        }, false);        
    });
    </script>
    <style>

    </style>
</head>
<body>

    <ul>
        <li>
            <a href="#" class="login">login()</a>
        </li>
        <li>
            <a href="#" class="isLoggedIn">isLoggedIn()</a>
        </li>
        <li>
            <a href="#" class="getPayload">getPayload()</a>
        </li>
        <li>
            <a href="#" class="getUserId">getUserId()</a>
        </li>
        <li>
            <a href="#" class="call1">call1()</a>
        </li>
        <li>
            <a href="#" class="call2">call2()</a>
        </li>
        <li>
            <a href="#" class="call3">call3()</a>
        </li>
        <li>
            <a href="#" class="logout">logout()</a>
        </li>
    </ul>
    
</body>
</html>