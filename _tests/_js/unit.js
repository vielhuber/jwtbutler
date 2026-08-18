let jwtbutler = require('../../_js/_build/script.js');

describe('jwtbutler client', () => {
    test('applies constructor defaults', () => {
        let client = new jwtbutler({ auth_server: 'https://auth.example.com' });

        expect(client.config).toEqual({
            auth_server: 'https://auth.example.com',
            auth_login: 'email',
            captcha: false,
            passkeys: false,
            language: 'en'
        });
    });
});
