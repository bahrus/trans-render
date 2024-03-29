export async function parse(s) {
    const specifier = {};
    const eventSplit = s.split('::');
    if (eventSplit[1] !== undefined) {
        specifier.evt = eventSplit[1];
    }
    const nonEventPart = eventSplit[0];
    const lenNonEventPart = nonEventPart.length;
    const head2 = nonEventPart.substring(0, 2);
    let tailStart = 0;
    let hasDss = false;
    switch (head2) {
        case '$0':
            specifier.self = true;
            tailStart = 2;
            break;
        case '^^':
            specifier.dss = '^';
            specifier.rec = true;
            tailStart = 2;
            break;
        default:
            const head0 = head2[0];
            switch (head0) {
                case '^':
                case 'Y':
                    specifier.dss = head0;
                    tailStart = 1;
            }
    }
    if (specifier.dss === undefined && tailStart < lenNonEventPart) {
        await parseProp(nonEventPart, tailStart, specifier);
    }
    return specifier;
}
async function parseProp(nonEventPart, tailStart, specifier) {
    const s = nonEventPart.substring(tailStart, tailStart + 1);
    const { scopeS } = specifier;
    tailStart++;
    const iPosOfSC = nonEventPart.indexOf(':', tailStart);
    let propInference;
    let subProp;
    let subPropIsComplex = false;
    if (iPosOfSC === -1) {
        specifier.prop = propInference = nonEventPart.substring(tailStart);
    }
    else {
        specifier.prop = propInference = nonEventPart.substring(tailStart, iPosOfSC);
        subProp = nonEventPart.substring(iPosOfSC + 1);
        if (subProp.includes(':') || subProp.includes('|')) {
            subProp = '.' + subProp.replaceAll(':', '.');
        }
    }
    if (s !== ':') {
        specifier.s = s;
    }
    switch (s) {
        case '#':
            specifier.elS = `#${propInference}`;
            break;
        case '|':
        case '%':
        case '-':
        case '~':
            if (scopeS === undefined) {
                specifier.scopeS = '[itemscope]';
                specifier.rec = true;
                specifier.rnf = true;
            }
            switch (s) {
                case '|':
                    specifier.elS = `[itemprop~="${propInference}"]`;
                    break;
                case '%':
                    specifier.elS = `[part~="${propInference}"]`;
                    break;
                case '-':
                    {
                        const { lispToCamel } = await import('../lib/lispToCamel.js');
                        const ms = specifier.ms = propInference;
                        specifier.prop = propInference = lispToCamel(propInference);
                        specifier.elS = `[-${ms}]`;
                    }
                    break;
                case '~': {
                    specifier.hpf = propInference;
                    const { camelToLisp } = await import('../lib/camelToLisp.js');
                    specifier.el = specifier.elS = camelToLisp(propInference);
                    delete specifier.prop;
                    break;
                }
            }
            break;
        case '@':
            specifier.elS = `[name="${propInference}"]`;
            if (scopeS === undefined) {
                specifier.scopeS = 'form';
                specifier.rnf = true;
            }
            break;
        case '/':
            specifier.host = true;
            break;
        case ':':
            //specifier.prop = propInference;
            break;
        default:
            throw 'NI';
    }
    if (subProp !== undefined) {
        switch (s) {
            case '#':
            case '%':
            case '@':
            case '-':
            case '|':
            case '/':
                specifier.path = subProp;
                break;
            case '~':
                specifier.prop = subProp;
                break;
        }
    }
}
