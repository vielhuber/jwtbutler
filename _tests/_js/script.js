describe('integration test', () =>
{
  beforeAll(async () =>
  {
    await page.goto('http://example-auth-page1.local')
  });

  test('overall behaviour', async () =>
  {
    await expect(page).toMatch('null');
    await expect(page).toClick('.login');
    await expect(page).toMatch('E-Mail-Adresse');
    await expect(page).toFillForm('.login_form__form', { email: 'david@vielhuber.de', password: 'secret' });
    await expect(page).toClick('.login_form__submit');
    await expect(page).toMatch('"exp"');
    await page.goto('http://example-auth-page2.local');
    await expect(page).toMatch('"exp"');
    await expect(page).toClick('.logout');
    await page.goto('http://example-auth-page3.local');
    await expect(page).toMatch('null');
  });
});