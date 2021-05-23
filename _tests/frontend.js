document.addEventListener('DOMContentLoaded', function () {
    const api = new jwtbutler({
        auth_server: 'http://example-auth-server.local.vielhuber.de',
        sso: [
            'http://example-auth-page1.local.vielhuber.de',
            'http://example-auth-page2.local.vielhuber.de',
            'http://example-auth-page3.local.vielhuber.de'
        ]
    });

    function updateStatus() {
        let payload = api.getPayload();
        document.querySelector('.status').innerHTML = JSON.stringify(payload);
        if (payload === null) {
            document.querySelector('.status').classList.add('null');
            document.querySelector('.status').classList.remove('not-null');
        } else {
            document.querySelector('.status').classList.add('not-null');
            document.querySelector('.status').classList.remove('null');
        }
    }

    updateStatus();

    document.querySelector('.isLoggedIn').addEventListener(
        'click',
        e => {
            console.log(api.isLoggedIn());
            e.preventDefault();
        },
        false
    );

    document.querySelector('.getPayload').addEventListener(
        'click',
        e => {
            console.log(api.getPayload());
            e.preventDefault();
        },
        false
    );

    document.querySelector('.getUserId').addEventListener(
        'click',
        e => {
            console.log(api.getUserId());
            e.preventDefault();
        },
        false
    );

    document.querySelector('.fetch1').addEventListener(
        'click',
        e => {
            api.fetch('http://example-auth-page1.local.vielhuber.de/protected/', { method: 'GET' })
                .then(res => res.json())
                .catch(error => error)
                .then(response => {
                    console.log(response);
                    updateStatus();
                });
            e.preventDefault();
        },
        false
    );

    document.querySelector('.fetch2').addEventListener(
        'click',
        e => {
            api.fetch('http://example-auth-page2.local.vielhuber.de/protected/', { method: 'GET' })
                .then(res => res.json())
                .catch(error => error)
                .then(response => {
                    console.log(response);
                    updateStatus();
                });
            e.preventDefault();
        },
        false
    );

    document.querySelector('.fetch3').addEventListener(
        'click',
        e => {
            api.fetch('http://example-auth-page3.local.vielhuber.de/protected/', { method: 'GET' })
                .then(res => res.json())
                .catch(error => error)
                .then(response => {
                    console.log(response);
                    updateStatus();
                });
            e.preventDefault();
        },
        false
    );

    document.querySelector('.login').addEventListener(
        'click',
        e => {
            api.login()
                .then(() => {
                    console.log('logged in!');
                    updateStatus();
                })
                .catch(() => {});
            e.preventDefault();
        },
        false
    );

    document.querySelector('.logout').addEventListener(
        'click',
        e => {
            api.logout()
                .then(() => {
                    console.log('logged out!');
                    updateStatus();
                })
                .catch(() => {});
            e.preventDefault();
        },
        false
    );
});
