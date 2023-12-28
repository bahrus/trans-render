import {
    TemplMgmt, 
    TemplMgmtProps, 
    TemplMgmtActions, 
    beTransformed, 
    XForm
} from '../lib/mixins/TemplMgmt.js';
import { CE } from '../froop/CE.js';
import {Localizer, LocalizerMethods} from '../lib/mixins/Localizer.js';

export interface DTRCounterProps {
    count: number;
} 


const ce = new CE<DTRCounterProps  & TemplMgmtProps, TemplMgmtActions>({
    mixins: [TemplMgmt, Localizer],
    config:  {
        tagName:'dtr-counter',
        actions:{
            ...beTransformed,
        },
        propDefaults:{
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
            } as XForm<DTRCounterProps, LocalizerMethods> as any,
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
            mainTemplate: String.raw `<button part=down data-d=-1>-</button><span part=count></span><button part=up data-d=1>+</button>`,
        },
        
    },
});