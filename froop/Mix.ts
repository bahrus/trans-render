import {r} from './const.js';
import {DefineArgs} from '../lib/types';
import { IMix} from './types';
import { Svc } from './Svc.js';

export class Mix extends Svc implements IMix {
    ext: {new(): HTMLElement};
    constructor(public args: DefineArgs){
        super();
        let ext = (args.superclass || HTMLElement) as {new(): HTMLElement};
        const proto = ext.prototype;
        const mixins = args.mixins;
        if(mixins !== undefined){
            for(const mix of mixins){
                if(typeof mix === 'function'){
                    ext = mix(ext);
                }else{
                    Object.assign(proto, mix);
                }
                
            }
        }
        this.ext = ext;
        this.resolved = true;
    }

}