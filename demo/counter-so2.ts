import {TemplMgmt, TemplMgmtProps, TemplMgmtActions, beTransformed} from '../lib/mixins/TemplMgmt.js';
import {html} from '../lib/html.js';
import {CE} from '../lib/CE.js';
import {INotifyMixin, INotifyPropInfo, NotifyMixin} from '../lib/mixins/notify.js';

export class CounterSoCore extends HTMLElement{
    count = 30;
    
    changeCount = (self: CounterSo, d: number, e: Event) => self.count += d;
}

export interface CounterSo extends  TemplMgmtProps, INotifyMixin, HTMLElement{
    count: number;
    buttonElements: any;
}

const mainTemplate = html`
<button part=down data-d=-1>-</button><span part=count></span><button part=up data-d=1>+</button>
<style>
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
`;

const ce = new CE<CounterSo & TemplMgmtProps, CounterSo & TemplMgmtActions, INotifyPropInfo>({
    config:  {
        tagName:'counter-so',
        propDefaults:{
            transform: [
                {
                    buttonElements: [{}, {click:['changeCount', 'dataset.d', 'parseInt']}]
                },
                {
                    countParts: "count"
                }
            ]
        },
        propInfo:{
            count: {
                notify: {dispatch:true},
            },
            buttonElements:{
            }
        },
        actions: {
            ...beTransformed,
        },
        propChangeMethod: 'onPropChange',
    },
    //This is where non serializable stuff goes
    complexPropDefaults:{
        mainTemplate
    },
    superclass: CounterSoCore,
    mixins: [NotifyMixin, TemplMgmt],
});