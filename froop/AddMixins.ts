import {r} from './const.js';
import {DefineArgs} from '../lib/types';
import {IAddMixins} from './types';
import { ReslvSvc } from './ReslvSvc.js';

export class AddMixins extends ReslvSvc implements IAddMixins {
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