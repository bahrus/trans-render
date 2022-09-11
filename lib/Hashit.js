export class Hashit {
    open;
    close;
    constructor(open, close) {
        this.open = open;
        this.close = close;
    }
    stringify(id, obj) {
        const { hash } = location;
        const json = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
        const idEncoded = btoa(id);
        const iPosOfStart = hash.indexOf(this.open + idEncoded);
        if (iPosOfStart > -1) {
            const iPosOfEnd = hash.indexOf(this.close, iPosOfStart);
            if (iPosOfEnd > -1) {
                let newHash = hash.substring(0, iPosOfStart + this.open.length + idEncoded.length);
                newHash += json;
                newHash += hash.substring(iPosOfEnd);
                return newHash;
            }
        }
        return hash + this.open + idEncoded + json + close;
    }
    parse(id) {
        const { hash } = location;
        const idEncoded = btoa(id);
        const iPosOfStart = hash.indexOf(this.open + idEncoded);
        if (iPosOfStart === -1)
            return null;
        const iPosOfEnd = hash.indexOf(this.close, iPosOfStart);
        if (iPosOfEnd === -1)
            return null;
        const json = JSON.parse(decodeURIComponent(escape(atob(hash.substring(iPosOfStart + this.open.length + idEncoded.length, iPosOfEnd)))));
        return json;
    }
}
