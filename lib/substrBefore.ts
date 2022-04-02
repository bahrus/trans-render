export function substrBefore(s: string, search: string, last = false){
    let returnS = s.trim();
    let iPosOfColon = last ? returnS.lastIndexOf(search) : returnS.indexOf(search);
    if(iPosOfColon > -1) return returnS.substr(0, iPosOfColon);
    return returnS;
}