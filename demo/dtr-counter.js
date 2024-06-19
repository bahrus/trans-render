import { Mount } from '../Mount.js';
import { localize } from '../funions/Localizer.js';
export class DTRCounter extends Mount {
    localize = localize;
    static config = {
        shadowRootInit: {
            mode: 'open'
        },
        mainTemplate: String.raw `<button part=down data-d=-1>-</button><data part=count aria-live=polite></data><button part=up data-d=1>+</button>`,
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
    * {
        --attrs-to-reflect: initial;
    }
</style>
            `
        ]
    };
}
await DTRCounter.bootUp();
customElements.define('dtr-counter', DTRCounter);
