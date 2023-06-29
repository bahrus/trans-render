//https://stackoverflow.com/questions/56647747/how-to-base64-encode-emojis-in-javascript
// Encode
// Encode
export function utoa(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
// Decode
export function atou(str) {
    return decodeURIComponent(escape(atob(str)));
}
