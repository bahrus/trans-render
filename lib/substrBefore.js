export function substrBefore(s, search) {
    let returnS = s.trim();
    let iPosOfColon = returnS.indexOf(search);
    if (iPosOfColon > -1)
        return returnS.substr(0, iPosOfColon);
    return returnS;
}
