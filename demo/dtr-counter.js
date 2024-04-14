import { Mount } from '../Mount.js';
export class DTRCounter extends Mount {
    static config = {
        name: 'dtr-counter',
        shadowRootInit: {
            mode: 'open'
        },
        mainTemplate: String.raw `<button part=down data-d=-1>-</button><data part=count></data><button part=up data-d=1>+</button>`,
        propDefaults: {
            count: 30,
        },
        propInfo: {
            ...super.mntCfgMxn.propInfo,
        },
        actions: {
            ...super.mntCfgMxn.actions
        },
        xform: {
            '% count': 0,
            button: {
                m: {
                    on: 'click',
                    inc: 'count',
                    byAmt: '.dataset.d',
                },
            }
        }
    };
}
await DTRCounter.bootUp();
customElements.define(DTRCounter.config.name, DTRCounter);
