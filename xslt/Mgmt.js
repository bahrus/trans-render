export class Mgmt {
    #xsltLookup = {};
    async getProcessor(xslt) {
        let xsltProcessor = this.#xsltLookup[xslt];
        if (xsltProcessor !== undefined) {
            return xsltProcessor;
        }
        const resp = await fetch(xslt);
        const xsltString = await resp.text();
        const xsltNode = new DOMParser().parseFromString(xsltString, 'text/xml');
        xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xsltNode);
        this.#xsltLookup[xslt] = xsltProcessor;
        return xsltProcessor;
    }
}
