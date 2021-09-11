import { tm } from '../lib/mixins/TemplMgmtWithPEST.js';
import { NotifyMixin } from '../lib/mixins/notify.js';
const mainTemplate = tm.html `
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
(new tm.CE({
    //config should be JSON serializable, importable via JSON import
    config: {
        tagName: 'counter-so',
        propDefaults: {
            initTransform: {
                buttonElements: [{}, { click: ['changeCount', 'dataset.d', 'parseInt'] }]
            },
            updateTransform: {
                "countParts": ["count"]
            },
            count: 30,
            renderOptions: {
                cacheQueries: true,
            },
        },
        propInfo: {
            count: {
                notify: { dispatch: true },
            },
            buttonElements: {
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
    complexPropDefaults: {
        mainTemplate
    },
    mixins: [NotifyMixin, tm.TemplMgmtMixin, {
            changeCount: (self, d, e) => self.count += d,
        }],
}));
