export default class helpers
{

    static cookieExists(cookie_name)
    {
        if(document.cookie !== undefined && this.cookieGet(cookie_name) !== null)
        {
            return true;
        }
        return false;
    }

    static cookieGet(cookie_name)
    {
        var cookie_match = document.cookie.match(new RegExp(cookie_name + '=([^;]+)'));
        if(cookie_match)
        {
            return decodeURIComponent(cookie_match[1]);
        }
        return null;
    }

    static cookieSet(cookie_name, cookie_value, days)
    {
        document.cookie = cookie_name+'='+encodeURIComponent(cookie_value)+'; '+'expires='+((new Date((new Date()).getTime() + (days*24*60*60*1000))).toUTCString())+'; path=/';
    }

    static cookieDelete(cookie_name)
    {
        document.cookie = cookie_name+'=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    }

    static remove(el)
    {
        if( el !== null )
        {
            el.parentNode.removeChild(el);
        }
    }

}