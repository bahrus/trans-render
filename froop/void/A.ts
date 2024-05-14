import { AttribsSettings } from "../../lib/types.js";
import {camelToLisp} from '../../lib/camelToLisp.js';
export function A(attribSettings: AttribsSettings, target: Element){
    
    for (const key in attribSettings) {
        const val = attribSettings[key];
        const cKey = camelToLisp(key);
        switch (typeof val) {
            case 'boolean':
                if(key.startsWith('.')){
                    const className = cKey.substr(1);
                    const verb = val ? 'add' : 'remove';
                    (<any>target.classList)[verb](className);
                }else if(key.startsWith('::')){
                    const partName = cKey.substr(2);
                    const verb = val ? 'add' : 'remove';
                    (<any>target).part[verb](partName);
                }else{
                    if (val) {
                        target.setAttribute(cKey, '');
                    } else {
                        target.removeAttribute(cKey);
                    }
                }

                break;
            case 'string':
                target.setAttribute(cKey, val);
                break;
            case 'number':
                target.setAttribute(cKey, val.toString());
                break;
            case 'object':
                if (val === null) {
                    target.removeAttribute(cKey);
                }else{
                    target.setAttribute(cKey, JSON.stringify(val));
                }
                break;
        }
    }
}