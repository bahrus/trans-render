import {MntCfg, Mount, MountActions, MountProps} from '../Mount.js';
import {localize} from '../mixins/Localizer.js';
import { ITransformer, UnitOfWork } from '../types.js';

export interface DTRCounterProps {
    count: number;
} 

export interface DTRCounterMethods {
    localize(model: any, transformer: ITransformer<any, any>, uow: UnitOfWork<any, any>, matchingElement: Element): string | Partial<HTMLDataElement> | Partial<HTMLTimeElement> | undefined; 
}
export class DTRCounter extends Mount{
    localize = localize
    static override config: MntCfg<DTRCounterProps & MountProps, DTRCounterMethods & MountActions> = {
        name: 'dtr-counter',
        shadowRootInit:{
            mode: 'open'
        },
        mainTemplate: String.raw `<button part=down data-d=-1>-</button><data part=count></data><button part=up data-d=1>+</button>`,
        propDefaults:{
            count: 30,
        },
        propInfo: {
            ...super.mntCfgMxn.propInfo,
        },
        actions:{
            ...super.mntCfgMxn.actions
        },
        xform: {
            '% count': 'localize',
            button: {
                m: {
                    on: 'click',
                    inc: 'count',
                    byAmt: '.dataset.d',
                },
            }
        }
    } 
}

await DTRCounter.bootUp();

customElements.define(DTRCounter.config.name!, DTRCounter);
