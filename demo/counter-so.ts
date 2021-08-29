import {tm, TemplMgmtProps, TemplMgmtActions} from '../lib/mixins/TemplMgmtWithPEST.js';
import {INotifyMixin, INotifyPropInfo, NotifyMixin} from '../lib/mixins/notify.js';
//import { PropInfo } from '../lib/types.js';

export interface CounterSo extends  TemplMgmtProps, INotifyMixin, HTMLElement{
    count: number;
    buttonElements: any;
}

const mainTemplate = tm.html`
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


(new tm.CE<CounterSo & TemplMgmtProps, CounterSo & TemplMgmtActions, INotifyPropInfo>({
    //config should be JSON serializable, importable via JSON import
    config:  {
        tagName:'counter-so',
        propDefaults:{
            initTransform: {
                buttonElements: [{}, {click:['changeCount', 'dataset.d', 'parseInt']}]
            },
            updateTransform: {
                "countParts": ["count"]
            },
            count: 30,
            renderOptions: {
                cacheQueries: true,
            },
        },
        propInfo:{
            count: {
                notify: {dispatch:true},
            },
            buttonElements:{
                isRef: true,
            }
        },
        actions: {
            ...tm.doInitTransform,
            doUpdateTransform: {
                ifKeyIn: ['count', 'updateTransform']
            }
        },
        propChangeMethod: 'onPropChange',
    },
    //This is where non serializable stuff goes
    complexPropDefaults:{
        mainTemplate
    },
    mixins: [NotifyMixin, tm.TemplMgmtMixin, {
        changeCount: (self: CounterSo, d: number, e: Event) => self.count += d,

    }],
}));

