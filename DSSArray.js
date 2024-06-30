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
        for (const dss of split) {
            if (dss === 'and')
                continue;
            specifiers.push(await parse(dss));
        }
        this.arrVal = specifiers;
    }
}
