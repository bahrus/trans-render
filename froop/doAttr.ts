import {IPropBag, IAttrChgCB} from './types';
import {PropInfo} from '../lib/types';
import {irm} from './const.js';

export async function doAttr(accb: IAttrChgCB, propInfos: {[key: string]: PropInfo}){
    const {name, oldVal, newVal, instance} = accb;
// if(n === 'defer-hydration' && nv === null && ov !== null){
//     await self.detachQR();
// }
    const {lispToCamel} = await import ('../lib/lispToCamel.js');
    let propName = lispToCamel(name);
    const prop = propInfos[propName];
    if(prop !== undefined){
        if(prop.dry && oldVal === newVal) return;
        //const aThis: any = self.inReflectMode ? values :  self as any;
        const aThis = instance as any;
        if(aThis[irm]) return;
        switch(prop.type){
            case 'String':
                aThis[propName] = newVal;
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
                        aThis[propName] = val; 
                    }
                    
                }
                break;
            case 'Number':
                aThis[propName] = Number(newVal);
                break;
            case 'Boolean':
                aThis[propName] = newVal !== null;
                break;
            case 'RegExp':
                aThis[propName] = new RegExp(newVal);
                break;
        }
    }
}