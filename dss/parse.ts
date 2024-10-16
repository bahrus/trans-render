import { Modulo, Sigils, Specifier } from "../ts-refs/trans-render/dss/types";

export async function parse(s: string) : Promise<Specifier>{

    const specifier: Specifier = {};
    const iPosOfAs = s.lastIndexOf(' as ');
    if(iPosOfAs > -1){
        specifier.as = s.substring(iPosOfAs + 4).trimEnd() as 'String';
        s = s.substring(0, iPosOfAs);
    }
    const eventSplit = s.split('::');
    if(eventSplit[1] !== undefined){
        specifier.evt = eventSplit[1];
    }
    
    let nonEventPart = eventSplit[0];
    if(!nonEventPart.startsWith('Y{')){
        const firstChar = nonEventPart[0];
        if(firstChar >= 'A'  && firstChar <= 'Z' || firstChar >= 'a' && firstChar <= 'z'){
            nonEventPart = '/' + nonEventPart;
        }
    }

    const lenNonEventPart = nonEventPart.length;
    const head2 = nonEventPart.substring(0, 2);
    let tailStart = 0;
    let hasDss = false;
    switch(head2){
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
        case '?':{
            //TODO
            throw 'NI';
        }
        case '%[':
            specifier.dss = '%';
            tailStart = 1;
            break;
        default: 
            const head0 = head2[0];
            switch(head0){
                case '^':
                case 'Y':
                    specifier.dss = head0;
                    tailStart = 1;
                // default:
                //     specifier.dss = '^';
            }

    }
    const dss = specifier.dss;
    if(dss !== undefined && dss !== '.'){
        const result = parseScope(nonEventPart, tailStart, specifier);
        tailStart = result.tailStart;
    }
    if(tailStart < lenNonEventPart){
        await parseProp(nonEventPart, tailStart, specifier);

    }
    return specifier;
}

async function parseProp(
    nonEventPart: string, tailStart: number, specifier: Specifier
){

    const s = specifier.self ? '$0' : nonEventPart.substring(tailStart, tailStart + 1) as Sigils | ':';
    const {scopeS, isModulo} = specifier;
    tailStart += specifier.self ? 2 : 1;
    const iPosOfSC = nonEventPart.indexOf(':', tailStart);
    let propInference: string;
    let subProp: string | undefined;
    let subPropIsComplex = false;
    if(iPosOfSC === -1){
        specifier.prop = propInference = nonEventPart.substring(tailStart);
    }else{
        specifier.prop = propInference = nonEventPart.substring(tailStart, iPosOfSC);
        subProp = nonEventPart.substring(iPosOfSC + 1);
        if(subProp.includes(':') || subProp.includes('|')){
            subProp = '.' + subProp.replaceAll(':', '.');
        }
        
    }
    if(s !== ':'){
        specifier.s = s;
    }
    switch(s){
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
            if(scopeS === undefined){
                if(specifier.dss === undefined) specifier.dss = '^';
                specifier.scopeS = '[itemscope]';
                specifier.rec = true;
                specifier.rnf = true;
            }
            switch(s){
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
                case '-':{
                    const {lispToCamel} = await import('../lib/lispToCamel.js');
                    const ms = specifier.ms = propInference;
                    specifier.prop = propInference = lispToCamel(propInference);
                    specifier.elS = `[-${ms}]`;
                }
                    break;
                case '~':{
                    specifier.host = true;
                    specifier.hpf = propInference;
                    const {camelToLisp} = await import('../lib/camelToLisp.js');
                    specifier.el = specifier.elS = camelToLisp(propInference);
                    delete specifier.prop;
                    break;
                }
            }
            break;
        case '@':
            specifier.elS = `[name="${propInference}"]`;
            if(scopeS === undefined && !isModulo){
                if(specifier.dss === undefined) specifier.dss = '^';
                specifier.scopeS = 'form';
                specifier.rnf = true;
            }
            break;
        // case '/':
        //     specifier.host = true;
        //     break; 
        case ':':
            //specifier.prop = propInference;
            break;
        default:
            throw 'NI';

    }
    if(subProp !== undefined){
        switch(s){
            case '#':
            case '%':
            case '@':
            case '-':
            case '|':
            case '/':
            case '$0':
                specifier.path = subProp;
                break;
            case '~':
                const split = (subProp[0] === '.' ? subProp.substring(1) : subProp).split('.');
                specifier.prop = split[0];
                const len = split.length;
                if(len > 1){
                    specifier.path = ((len > 2 || subProp.includes('|')) ? '.' : '') + split.slice(1).join('.');
                }
              break;
        }
    }

    
    
}

function parseScope(
    nonEventPart: string, tailStart: number, specifier: Specifier
) : {tailStart: number}{
    const openingSymbol = nonEventPart.substring(tailStart, tailStart + 1);
    let iPosOfClosedBrace: number;
    switch(openingSymbol){
        case '{':
            iPosOfClosedBrace = nonEventPart.indexOf('}', tailStart + 2);
            if(iPosOfClosedBrace === -1) throw 'PE'; // parsing error
            let scopeS = nonEventPart.substring(tailStart + 1, iPosOfClosedBrace);
            if(scopeS.startsWith('(') && scopeS.endsWith(')')){
                specifier.isiss = true;
                scopeS = scopeS.substring(1, scopeS.length - 1);
            }
            specifier.scopeS = scopeS;
            break;
        case '[':
            iPosOfClosedBrace = nonEventPart.indexOf(']', tailStart + 2);
            specifier.isModulo = true;
            specifier.modulo = nonEventPart.substring(tailStart + 1, iPosOfClosedBrace).toLowerCase() as Modulo;
            break;
        default:
            throw 'PE'; //Parsing error
    }
    
    return {
        tailStart: iPosOfClosedBrace + 1
    }
}