<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1" />
    <script src="jwtbutler.js"></script>
    <script src="frontend.min.js"></script>
    <title>.</title>
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
                <a href="#" class="logout">logout()</a>
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
                <a href="http://example-auth-page1.vielhuber.dev/">go to page1</a>
            </li>
            <li>
                <a href="http://example-auth-page2.vielhuber.dev/">go to page2</a>
            </li>
            <li>
                <a href="http://example-auth-page3.vielhuber.dev/">go to page3</a>
            </li>
        </ul>

    </div>
    
</body>
</html>