export class Hashit{
    constructor(public open: string, public close: string){

    }

    setItem(id: string, obj: any){
        const {hash} = location;
        const json = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
        const idEncoded = btoa(id);
        const iPosOfStart = hash.indexOf(this.open + idEncoded );
        if(iPosOfStart > -1){
            const iPosOfEnd = hash.indexOf(this.close, iPosOfStart);
            if(iPosOfEnd > -1){
                let newHash = hash.substring(0, iPosOfStart + this.open.length + idEncoded.length);
                newHash += json;
                newHash += hash.substring(iPosOfEnd);
                location.hash = newHash;
                return;
            }
        }
        location.hash += this.open + idEncoded + json + close;
    }
    
    getItem(id: string){
        const {hash} = location;
        const idEncoded = btoa(id);
        const iPosOfStart  = hash.indexOf(this.open + idEncoded);
        if(iPosOfStart === -1) return null;
        const iPosOfEnd = hash.indexOf(this.close, iPosOfStart);
        if(iPosOfEnd === -1) return null;
        const json = JSON.parse(decodeURIComponent(escape(atob(hash.substring(iPosOfStart + this.open.length + idEncoded.length, iPosOfEnd)))));
        return json;
    }
}