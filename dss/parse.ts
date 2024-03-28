import { Specifier } from './types';

export async function parse(s: string) : Promise<Specifier>{
    const specifier: Specifier = {};
    const eventSplit = s.split('::');
    specifier.evt = eventSplit[1];
    const nonEventPart = eventSplit[0];
    const head2 = nonEventPart.substring(0, 1);
    let tail: string;
    switch(head2){
        case '$0':
            specifier.self = true;
            break;
        case '^^':
            specifier.
    }
    return specifier;
}