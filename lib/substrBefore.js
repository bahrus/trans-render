//deprecate -- use splitonce
export function substrBefore(s, search, last = false) {
    let returnS = s.trim();
    let iPosOfSearch = last ? returnS.lastIndexOf(search) : returnS.indexOf(search);
    if (iPosOfSearch > -1)
        return returnS.substr(0, iPosOfSearch);
    return returnS;
}
