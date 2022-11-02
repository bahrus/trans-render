import {IPropBag, IAttrChgCB} from './types';
import {PropInfo} from '../lib/types';
import {irm} from './const.js';

export async function doAttr(accb: IAttrChgCB, propInfos: {[key: string]: PropInfo}, defaults: {[key: string]: any}){
    //only set prop from attr if prop value is undefined or prop value === default val and prop value !== attr val
    const {name, oldVal, newVal, instance} = accb;
    const {lispToCamel} = await import ('../lib/lispToCamel.js');
    let propName = lispToCamel(name);
    const prop = propInfos[propName];
    const aThis = instance as any;
    if(aThis[propName] !== undefined && aThis[propName] !== defaults[propName]) return;
    if(prop !== undefined){
        if(prop.dry && oldVal === newVal) return;
        //const aThis: any = self.inReflectMode ? values :  self as any;
        
        //if(aThis[irm]) return;
        let newPropVal = undefined;
        switch(prop.type){
            case 'String':
                newPropVal = newVal;
                //aThis[propName] = newVal;
                break;
            case 'Object':
                if(prop.parse){
                    if(newVal!==null){
                        let val = newVal.trim();
                        try{
                            val = JSON.parse(val);
                        }catch(e){
                            console.error({val, e});
                        }
                        //aThis[propName] = val; 
                        newPropVal = val;
                    }
                    
                }
                break;
            case 'Number':
                newPropVal = Number(newVal);
                break;
            case 'Boolean':
                newPropVal = newVal !== null;
                break;
            case 'RegExp':
                newPropVal = new RegExp(newVal);
                break;
        }
        if(newPropVal !== undefined){
            if(aThis[propName] !== newPropVal){
                aThis[propName] = newPropVal;
            }
        }
    }
}