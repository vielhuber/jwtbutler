describe('integration test', () => {
    beforeAll(async () => {
        await page.goto('https://example-auth-page1.vielhuber.dev', { waitUntil: 'networkidle2' });
    }, 3000);

    async function expectPageToContain(text) {
        const html = await page.content();
        expect(html).toMatch(text);
    }

    it('overall behaviour', async () => {
        await expectPageToContain('null');
        await expect(page).toClick('.login');
        await expectPageToContain('E-Mail-Adresse');
        await expect(page).toFillForm('.login-form__form', { email: 'david@vielhuber.de', password: 'secret' });
        await expect(page).toClick('.login-form__submit');
        await page.waitForSelector('.status.not-null');
        await expectPageToContain('"exp"');
        await page.goto('https://example-auth-page2.vielhuber.dev', { waitUntil: 'networkidle2' });
        await page.waitForSelector('.status.not-null');
        await expectPageToContain('"exp"');
        await expect(page).toClick('.logout');
        await page.waitForSelector('.status.null');
        await expectPageToContain('null');
        await page.goto('https://example-auth-page3.vielhuber.dev', { waitUntil: 'networkidle2' });
        await page.waitForSelector('.status.null');
        await expectPageToContain('null');
    }, 10000);
});
