import {CookieOptions, protocols, SavingContext, USL} from '../ts-refs/trans-render/XV/types.js';
//https://javascript.info/cookie


// returns the cookie with the given name,
// or undefined if not found
export function get(name: string) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

/**
 * Example of use:
 * setCookie('user', 'John', {secure: true, 'max-age': 3600});
 * @param name 
 * @param attributes 
 */
export function set(name: string, value: string, attributes : Partial<CookieOptions> = {}, ctx?: SavingContext) {

    attributes = {
      path: '/',
      // add other defaults here if necessary
      ...attributes
    } as CookieOptions;
  
    if (attributes.expires instanceof Date) {
      attributes.expires = attributes.expires.toUTCString();
    }
  
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
    for (let attributeKey in attributes) {
      updatedCookie += "; " + attributeKey;
      let attributeValue = attributes[attributeKey as keyof CookieOptions];
      if (attributeValue !== true) {
        updatedCookie += "=" + attributeValue;
      }
    }
  
    document.cookie = updatedCookie;
    const msg = `cookie://${name}` as USL;
    if(ctx !== undefined){
        ctx.USLs.add(msg);
    }else{
        window.postMessage(new Set([msg]));
    }
  }
  
  