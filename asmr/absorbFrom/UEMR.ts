import { AbsOptions, AbsorbingObject, BuiltInEditables, SharingObject } from '../../ts-refs/trans-render/asmr/types';
/**
 * User editable mind read
 * @param el 
 * @param ao 
 */
export function UEMR(el: Element, ao: AbsOptions){
    ao.isUE = true;
    let {UEEN, propToAbsorb} = ao;
    const {localName} = el;
    if(propToAbsorb === undefined){
        switch(localName){
            case 'input':
                if(UEEN === undefined) ao.UEEN = 'input';
                if(propToAbsorb === undefined){
                    const {type} = el as HTMLInputElement;
                    switch(type){
                        case 'number':
                        case 'range':
                            ao.propToAbsorb = 'valueAsNumber';
                            break;
                        case 'checkbox':
                            ao.propToAbsorb = 'checked';
                            break;
                        case 'date':
                        case 'datetime-local':
                            ao.propToAbsorb = 'valueAsDate';
                            break;
                        case 'password':
                        case 'email':
                        case 'tel':
                        case 'url':
                        case 'text':
                            ao.propToAbsorb = 'value';
                            break;
                        case 'file':
                            throw 'NI';
                        case 'image':
                            throw 'NI';
                        case 'color':
                            throw 'NI';
                        case 'radio':
                            throw 'NI';
                        case 'reset':
                            throw 'NI';
                        case 'time':
                            throw 'NI';
                        case 'week':
                            throw 'NI';
                        default:

                    }
                }
                break;
            case 'default':
                //content editable
                if(UEEN === undefined) ao.UEEN = 'input';
                if(propToAbsorb === undefined) ao.propToAbsorb = 'textContent';
                break;
        }

    }
}