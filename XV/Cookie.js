//https://javascript.info/cookie
// returns the cookie with the given name,
// or undefined if not found
export function get(name) {
    let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
/**
 * Example of use:
 * setCookie('user', 'John', {secure: true, 'max-age': 3600});
 * @param name
 * @param attributes
 */
export function set(name, value, attributes = {}, ctx) {
    attributes = {
        path: '/',
        // add other defaults here if necessary
        ...attributes
    };
    if (attributes.expires instanceof Date) {
        attributes.expires = attributes.expires.toUTCString();
    }
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    for (let attributeKey in attributes) {
        updatedCookie += "; " + attributeKey;
        let attributeValue = attributes[attributeKey];
        if (attributeValue !== true) {
            updatedCookie += "=" + attributeValue;
        }
    }
    document.cookie = updatedCookie;
    const msg = `cookie://${name}`;
    if (ctx !== undefined) {
        ctx.USLs.add(msg);
    }
    else {
        window.postMessage(new Set([msg]));
    }
}
