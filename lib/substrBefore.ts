export function substrBefore(s: string, search: string){
    let returnS = s.trim();
    let iPosOfColon = returnS.indexOf(search);
    if(iPosOfColon > -1) return returnS.substr(0, iPosOfColon);
    return returnS;
}