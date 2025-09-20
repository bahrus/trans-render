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
        const { splitRefs } = await import('mount-observer/refid/splitRefs.js');
        const split = splitRefs(this.s);
        const specifiers = [];
        let lastDSS;
        for (const dss of split) {
            if (dss === 'and')
                continue;
            lastDSS = await parse(dss);
            specifiers.push(lastDSS);
        }
        this.arrVal = specifiers;
    }
}
