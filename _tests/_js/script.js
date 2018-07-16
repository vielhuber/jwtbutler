describe('integration test', () =>
{
  beforeAll(async () =>
  {
    await page.goto('http://example-auth-page1.local', { waitUntil: 'networkidle2' })
  }, 3000);

  test('overall behaviour', async () =>
  {
    await expect(page).toMatch('null');
    await expect(page).toClick('.login');
    await expect(page).toMatch('E-Mail-Adresse');
    await expect(page).toFillForm('.login-form__form', { email: 'david@vielhuber.de', password: 'secret' });
    await expect(page).toClick('.login-form__submit');
    await expect(page).toMatch('"exp"');
    await page.goto('http://example-auth-page2.local', { waitUntil: 'networkidle2' });
    await expect(page).toMatch('"exp"');
    await expect(page).toClick('.logout');
    await expect(page).toMatch('null');
    await page.goto('http://example-auth-page3.local', { waitUntil: 'networkidle2' });
    await expect(page).toMatch('null');
  }, 10000);
});