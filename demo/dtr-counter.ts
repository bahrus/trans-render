import {MntCfg, Mount, MountActions, MountProps} from '../Mount.js';
import {localize} from '../funions/Localizer.js';
import { ITransformer, UnitOfWork } from '../ts-refs/trans-render/types.js';

export interface DTRCounterProps {
    count: number;
} 

export interface DTRCounterMethods {
    localize(model: any, transformer: ITransformer<any, any>, uow: UnitOfWork<any, any>, matchingElement: Element): string | Partial<HTMLDataElement> | Partial<HTMLTimeElement> | undefined; 
}
export class DTRCounter extends Mount{
    localize = localize;
    static override config: MntCfg<DTRCounterProps & MountProps, DTRCounterMethods & MountActions> = {
        shadowRootInit:{
            mode: 'open'
        },
        mainTemplate: String.raw `<button part=down data-d=-1>-</button><data part=count aria-live=polite></data><button part=up data-d=1>+</button>`,
        propDefaults:{
            count: 30,
        },
        propInfo: {
            ...super.mntCfgMxn.propInfo,
            count: {
                type: 'Number',
                def: 30,
                parse: true,
                attrName: 'count',
                propName: 'count',
            }
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
        },
        styles: [
            String.raw `
<style>
    :host{
        display: block;
    }
    * {
      font-size: 200%;
    }

    span {
      width: 4rem;
      display: inline-block;
      text-align: center;
    }

    button {
      width: 4rem;
      height: 4rem;
      border: none;
      border-radius: 10px;
      background-color: seagreen;
      color: white;
    }

</style>
            `
        ]
    } 
}

await DTRCounter.bootUp();

customElements.define('dtr-counter', DTRCounter);
