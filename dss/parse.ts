import { Sigils, Specifier } from './types';

export async function parse(s: string) : Promise<Specifier>{
    const specifier: Specifier = {};
    const eventSplit = s.split('::');
    specifier.evt = eventSplit[1];
    const nonEventPart = eventSplit[0];
    const head2 = nonEventPart.substring(0, 1);
    let tailStart = 0;
    let hasDss = false;
    switch(head2){
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
            switch(head0){
                case '^':
                case 'Y':
                    specifier.dss = head0;
                    tailStart = 1;
            }

    }
    if(specifier.dss === undefined){
        parseProp(nonEventPart, tailStart, specifier);

    }
    return specifier;
}

function parseProp(
    nonEventPart: string, tailStart: number, specifier: Specifier
){
    const s = nonEventPart.substring(tailStart, 1) as Sigils;
    const {scopeS} = specifier;
    tailStart++;
    const iPosOfSC = nonEventPart.indexOf(':', tailStart);
    const propInference = iPosOfSC === -1 ? nonEventPart.substring(tailStart) : nonEventPart.substring(tailStart, iPosOfSC);

    switch(s){
        case '#':
            specifier.elS = `#${propInference}`;
            break;
            case '%':
                specifier.elS = `[part~="${propInference}"]`;
                if(scopeS === undefined){
                    specifier.scopeS = '[itemscope]';
                    specifier.rec = true;
                }
                break;
                case '@':
                    specifier.elS = `[name="${propInference}"]`;
                    if(scopeS === undefined){
                        specifier.scopeS = 'form';

                    }

    }
    specifier.s = s;
    
}