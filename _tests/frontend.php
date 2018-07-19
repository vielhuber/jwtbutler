<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1" />
    <script src="jwtbutler.js"></script>
    <title>.</title>
    <script>
    document.addEventListener('DOMContentLoaded', function()
    {
        const api = new jwtbutler({
            auth_server: 'http://example-auth-server.local',
            sso: [
                'http://example-auth-page1.local',
                'http://example-auth-page2.local',
                'http://example-auth-page3.local'
            ],
        });

        function updateStatus()
        {
            let payload = api.getPayload();
            document.querySelector('.status').innerHTML = JSON.stringify( payload );
            if( payload === null )
            {
                document.querySelector('.status').classList.add('null');
                document.querySelector('.status').classList.remove('not-null');
            }
            else
            {
                document.querySelector('.status').classList.add('not-null');
                document.querySelector('.status').classList.remove('null');
            }
        }
        
        updateStatus();

        document.querySelector('.isLoggedIn').addEventListener('click', (e) =>
        {
            console.log( api.isLoggedIn() );
            e.preventDefault();
        }, false);

        document.querySelector('.getPayload').addEventListener('click', (e) =>
        {
            console.log( api.getPayload() );
            e.preventDefault();
        }, false);

        document.querySelector('.getUserId').addEventListener('click', (e) =>
        {
            console.log( api.getUserId() );
            e.preventDefault();
        }, false);

        document.querySelector('.fetch1').addEventListener('click', (e) =>
        {
            api.fetch('http://example-auth-page1.local/protected/', { method: 'GET' }).then(res => res.json()).catch(error => error).then(response => { console.log(response); updateStatus(); });
            e.preventDefault();
        }, false);

        document.querySelector('.fetch2').addEventListener('click', (e) =>
        {
            api.fetch('http://example-auth-page2.local/protected/', { method: 'GET' }).then(res => res.json()).catch(error => error).then(response => { console.log(response); updateStatus(); });
            e.preventDefault();
        }, false);

        document.querySelector('.fetch3').addEventListener('click', (e) =>
        {
            api.fetch('http://example-auth-page3.local/protected/', { method: 'GET' }).then(res => res.json()).catch(error => error).then(response => { console.log(response); updateStatus(); });
            e.preventDefault();
        }, false);

        document.querySelector('.login').addEventListener('click', (e) =>
        {
            api.login().then(() => { console.log('logged in!'); updateStatus(); });
            e.preventDefault();
        }, false);

        document.querySelector('.logout').addEventListener('click', (e) =>
        {
            api.logout().then(() => { console.log('logged out!'); updateStatus(); });
            e.preventDefault();
        }, false);        
    });
    </script>
    <style>
        #app
        {
            border:20px solid #eee;
        }
        html.jwtbutler-login-form-visible #app
        {
            border-color:yellow;
        }
        html.jwtbutler-loading #app
        {
            border-color:red;
        }
        html.jwtbutler-fetching #app
        {
            border-color:blue;
        }
    </style>
</head>
<body>

    <div id="app">

        <div class="status">
        </div>

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
                <a href="#" class="fetch1">fetch() from page1</a>
            </li>
            <li>
                <a href="#" class="fetch2">fetch() from page2</a>
            </li>
            <li>
                <a href="#" class="fetch3">fetch() from page3</a>
            </li>
            <li>
                <a href="#" class="logout">logout()</a>
            </li>
            <li>
                <a href="http://example-auth-page1.local/">go to page1</a>
            </li>
            <li>
                <a href="http://example-auth-page2.local/">go to page2</a>
            </li>
            <li>
                <a href="http://example-auth-page3.local/">go to page3</a>
            </li>
        </ul>

    </div>
    
</body>
</html>