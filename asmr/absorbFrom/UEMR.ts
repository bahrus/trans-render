import { AbsOptions, AbsorbingObject, BuiltInEditables, SharingObject } from '../../ts-refs/trans-render/asmr/types';
/**
 * User editable mind read
 * @param el 
 * @param ao 
 */
export function UEMR(el: Element, ao: AbsOptions){
    ao.isUE = true;
    let {evt, propToAbsorb} = ao;
    const {localName} = el;
    if(propToAbsorb === undefined){
        switch(localName){
            case 'input':
                if(evt === undefined) ao.evt = 'input';
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
                            ao.propToAbsorb = 'value';
                    }
                }
                break;
            case 'button':
                if(evt === undefined) ao.evt = 'click';
                if(propToAbsorb === undefined){
                    ao.propToAbsorb = 'value';
                }
                break;
            case 'form':
                if(evt === undefined) ao.evt = 'input';
                if(propToAbsorb === undefined){
                    ao.propToAbsorb = 'formData'
                }
                break;
            default:
                //content editable
                if(evt === undefined) ao.evt = 'input';
                if(propToAbsorb === undefined) ao.propToAbsorb = 'textContent';
                break;
        }

    }
}