export class DSSArray {
    s;
    strVal;
    objVal;
    arrVal;
    constructor(s) {
        this.s = s;
    }
    async parse() {
        const { parse } = await import('./dss/parse.js');
        const split = this.s.split(' ').map(s => s.trim()).filter(s => !!s);
        const specifiers = [];
        let lastDSS;
        let inAsMode = false;
        for (const dss of split) {
            if (dss === 'and')
                continue;
            if (dss === 'as') {
                inAsMode = true;
                continue;
            }
            if (lastDSS !== undefined && inAsMode) {
                lastDSS.as = dss;
                inAsMode = false;
                continue;
            }
            lastDSS = await parse(dss);
            specifiers.push(lastDSS);
        }
        this.arrVal = specifiers;
    }
}
