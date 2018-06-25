import hlp from 'hlp';
import Page from './_page';
import 'babel-polyfill'; // use Array.includes etc. in IE11

document.addEventListener('DOMContentLoaded', () =>
{
    let page = new Page();
    page.init();    
    window.page = page;
});