import {TRElementActions, TRElementProps, } from '../ts-refs/trans-render/lib/types.js'; 
import {PropInfo} from '../ts-refs/trans-render/froop/types.js';
export async function doAttrCC(
        self: TRElementActions & TRElementProps, 
        values: {[key: string]: any}, 
        propInfos: {[key: string]: any},
        toCamel: (s: string) => string, 
        n: string, ov: string, nv: string
    ){
    if(n === 'defer-hydration' && nv === null && ov !== null){
        await self.detachQR();
    }

    let propName = toCamel(n);
    const prop = propInfos[propName];
    if(prop !== undefined){
        if(prop.dry && ov === nv) return;
        const aThis: any = self.inReflectMode ? values :  self as any;
        switch(prop.type){
            case 'String':
                aThis[propName] = nv;
                break;
            case 'Object':
                if(prop.parse){
                    if(nv!==null){
                        let val = nv.trim();
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
                aThis[propName] = Number(nv);
                break;
            case 'Boolean':
                aThis[propName] = nv !== null;
                break;
            case 'RegExp':
                aThis[propName] = new RegExp(nv);
                break;
        }
    }
}