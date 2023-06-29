import {atou, utoa} from './tau.js';
export class Hashit{
    constructor(public open: string, public close: string){}

    stringify(id: string, obj: any): string{
        let {hash} = location;
        if(hash.length > 0 && hash[0] === '#') hash = hash.substr(1);
        const json = utoa(JSON.stringify(obj));
        const idEncoded = btoa(id);
        const iPosOfStart = hash.indexOf(this.open + idEncoded );
        if(iPosOfStart > -1){
            const iPosOfEnd = hash.indexOf(this.close, iPosOfStart);
            if(iPosOfEnd > -1){
                let newHash = hash.substring(0, iPosOfStart + this.open.length + idEncoded.length);
                newHash += json;
                newHash += hash.substring(iPosOfEnd);
                return newHash;
            }
        }
        const amp = hash.length !== 0 ? '&' : '';
        return hash + amp + this.open + idEncoded + json + this.close;
    }
    
    parse(id: string){
        const {hash} = location;
        const idEncoded = btoa(id);
        const iPosOfStart  = hash.indexOf(this.open + idEncoded);
        if(iPosOfStart === -1) return null;
        const iPosOfEnd = hash.indexOf(this.close, iPosOfStart);
        if(iPosOfEnd === -1) return null;
        const json = JSON.parse(atou(hash.substring(iPosOfStart + this.open.length + idEncoded.length, iPosOfEnd)));
        return json;
    }
}