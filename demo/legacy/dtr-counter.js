import { TemplMgmt, beTransformed } from '../../lib/mixins/TemplMgmt.js';
import { CE } from '../../froop/CE.js';
import { Localizer } from '../../lib/mixins/Localizer.js';
const ce = new CE({
    mixins: [TemplMgmt, Localizer],
    config: {
        tagName: 'dtr-counter',
        actions: {
            ...beTransformed,
        },
        propDefaults: {
            count: 30,
            xform: {
                '% count': 'localize',
                "button": {
                    m: {
                        on: 'click',
                        inc: 'count',
                        byAmt: '.dataset.d',
                    },
                }
            },
            shadowRootMode: 'open',
            styles: String.raw `
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
`,
            mainTemplate: String.raw `<button part=down data-d=-1>-</button><data part=count></data><button part=up data-d=1>+</button>`,
        },
    },
});
