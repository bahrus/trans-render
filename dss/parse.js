export async function parse(s) {
    const specifier = {};
    const iPosOfAs = s.lastIndexOf(' as ');
    if (iPosOfAs > -1) {
        specifier.as = s.substring(iPosOfAs + 4).trimEnd();
        s = s.substring(0, iPosOfAs);
    }
    const eventSplit = s.split('::');
    let [nonEventPart, evts] = eventSplit;
    if (evts !== undefined) {
        const evtSplit2 = evts.split('|');
        const [evt, ...rest] = evtSplit2;
        if (evt) {
            specifier.evt = evt;
        }
        specifier.raps = rest;
    }
    const enhancementSplit = nonEventPart.split('+');
    let [nonEnhancementPart, enhancement] = enhancementSplit;
    specifier.enhBase = enhancement;
    nonEventPart = nonEnhancementPart;
    //let nonEventPart = eventSplit[0];
    if (nonEventPart[0] === '`' && nonEventPart.endsWith('`')) {
        let inside = nonEventPart.substring(1, nonEventPart.length - 1);
        if (specifier.as) {
            switch (specifier.as) {
                case 'number':
                case 'boolean':
                case 'object':
                case 'boolean|number':
                    inside = JSON.parse(inside);
                    break;
                default:
                    throw 'NI';
            }
        }
        specifier.constVal = inside;
        return specifier;
    }
    if (!nonEventPart.startsWith('Y{')) {
        const firstChar = nonEventPart[0];
        if (firstChar >= 'A' && firstChar <= 'Z' || firstChar >= 'a' && firstChar <= 'z') {
            nonEventPart = '/' + nonEventPart;
        }
    }
    const lenNonEventPart = nonEventPart.length;
    const head2 = nonEventPart.substring(0, 2);
    let tailStart = 0;
    //let hasDss = false;
    switch (head2) {
        case '$0':
            specifier.self = true;
            specifier.dss = '.';
            //specifier.s = '$0';
            break;
        case '^^':
            specifier.dss = '^';
            specifier.rec = true;
            tailStart = 2;
            break;
        case 'Y*':
            specifier.dss = 'Y';
            specifier.rec = true;
            tailStart = 2;
            break;
        case '?': {
            //TODO
            throw 'NI';
        }
        case '%[':
            specifier.dss = '%';
            tailStart = 1;
            break;
        case '/*':
            specifier.dss = '/**/';
            specifier.cmtWrap = true;
            tailStart = 2;
            break;
        default:
            const head0 = head2[0];
            switch (head0) {
                case '^':
                case 'Y':
                case '$':
                    specifier.dss = head0;
                    tailStart = 1;
                // default:
                //     specifier.dss = '^';
            }
    }
    const dss = specifier.dss;
    if (dss !== undefined && dss !== '.') {
        const result = parseScope(nonEventPart, tailStart, specifier);
        tailStart = result.tailStart;
    }
    if (tailStart < lenNonEventPart) {
        await parseNonEventPart(nonEventPart, tailStart, specifier);
    }
    return specifier;
}
async function parseNonEventPart(nonEventPart, tailStart, specifier) {
    const iPosOfQuestionPeriod = nonEventPart.indexOf('?.');
    if (iPosOfQuestionPeriod === -1) {
        await parseNonEventNonPath(nonEventPart, tailStart, specifier);
        return;
    }
    const fullPath = nonEventPart.substring(iPosOfQuestionPeriod);
    //optimize?
    const split = fullPath.split('?.');
    const prop = split.at(-1);
    //specifier.prop = split.at(-1);
    if (prop === '$0') {
        //TODO:  might not always be + 1;
        specifier.prop = nonEventPart.substring(tailStart + 1, iPosOfQuestionPeriod);
    }
    else {
        specifier.prop = prop;
    }
    specifier.path = split.length === 1 ? specifier.prop : fullPath;
    await parseNonEventNonPath(nonEventPart.substring(0, iPosOfQuestionPeriod), tailStart, specifier);
}
function parseScope(nonEventPart, tailStart, specifier) {
    const { dss, cmtWrap } = specifier;
    if (cmtWrap) {
        specifier.scopeS = nonEventPart.substring(tailStart, nonEventPart.length - 2);
        return {
            tailStart: nonEventPart.length
        };
    }
    let iPosOfClosedBrace;
    const openingSymbol = nonEventPart.substring(tailStart, tailStart + 1);
    switch (openingSymbol) {
        case '{':
            iPosOfClosedBrace = nonEventPart.indexOf('}', tailStart + 2);
            if (iPosOfClosedBrace === -1)
                throw 'PE'; // parsing error
            let scopeS = nonEventPart.substring(tailStart + 1, iPosOfClosedBrace);
            if (scopeS.startsWith('(') && scopeS.endsWith(')')) {
                specifier.isiss = true;
                scopeS = scopeS.substring(1, scopeS.length - 1);
            }
            specifier.scopeS = scopeS;
            break;
        case '[':
            iPosOfClosedBrace = nonEventPart.indexOf(']', tailStart + 2);
            const stuffBetweenBraces = nonEventPart.substring(tailStart + 1, iPosOfClosedBrace);
            switch (dss) {
                case '$': {
                    const split = stuffBetweenBraces.split('|');
                    const [ceName, itemProp] = split;
                    specifier.is$cope = true;
                    specifier.$copeDetail = {
                        ceName, itemProp
                    };
                    break;
                }
                case '%': {
                    specifier.isModulo = true;
                    specifier.modulo = stuffBetweenBraces.toLowerCase();
                    break;
                }
            }
            break;
        default:
            throw 'PE'; //Parsing error
    }
    return {
        tailStart: iPosOfClosedBrace + 1
    };
}
async function parseNonEventNonPath(nonEventNonPathPart, tailStart, specifier) {
    const sigil = (specifier.self ? '$0' : nonEventNonPathPart.substring(tailStart, tailStart + 1));
    specifier.s = sigil;
    if (sigil === '$0') {
        if (specifier.prop === undefined)
            specifier.prop = '$0';
        return;
    }
    const { scopeS, isModulo, is$cope } = specifier;
    tailStart += specifier.self ? 2 : 1;
    //const propAndPath = nonEventPart.substring(tailStart);
    let propInference = nonEventNonPathPart.substring(tailStart);
    if (specifier.prop === undefined) {
        specifier.prop = propInference;
    }
    // if(sigil !== ':'){
    //     specifier.s = sigil;
    // }
    switch (sigil) {
        case '':
            if (scopeS !== undefined) {
                //define regular expression that tests if scopeS matches  kebab-case lower case words 
                const re = /^[a-z]+(-[a-z]+)*$/;
                if (re.test(scopeS)) {
                    specifier.host = true;
                }
            }
            break;
        case '$0':
            break;
        case '#':
            specifier.elS = `${propInference}`;
            break;
        case '|':
        case '%':
        case '-':
        case '~':
        case '/':
            if (scopeS === undefined) {
                if (specifier.dss === undefined)
                    specifier.dss = '^';
                specifier.scopeS = '[itemscope]';
                specifier.rec = true;
                specifier.rnf = true;
            }
            switch (sigil) {
                case '/':
                    specifier.elS = '*';
                    specifier.host = true;
                    break;
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
                    specifier.host = true;
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
            if (scopeS === undefined && !isModulo && !is$cope) {
                if (specifier.dss === undefined)
                    specifier.dss = '^';
                specifier.scopeS = 'form';
                specifier.rnf = true;
            }
            break;
        // case '/':
        //     specifier.host = true;
        //     break; 
        // case ':':
        //     //specifier.prop = propInference;
        //     break;
        default:
            throw 'NI';
    }
    // if(subProp !== undefined){
    //     switch(sigil){
    //         case '#':
    //         case '%':
    //         case '@':
    //         case '-':
    //         case '|':
    //         case '/':
    //         case '$0':
    //             specifier.path = subProp;
    //             break;
    //         case '~':
    //             const split = (subProp.startsWith('?.') ? subProp.substring(1) : subProp).split('?.');
    //             specifier.prop = split[0];
    //             const len = split.length;
    //             if(len > 1){
    //                 specifier.path = ((len > 2 || subProp.includes('|')) ? '?.' : '') + split.slice(1).join('?.');
    //             }
    //           break;
    //     }
    // }
}
