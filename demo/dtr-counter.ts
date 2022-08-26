import {TemplMgmt, TemplMgmtProps, TemplMgmtActions, beTransformed} from '../lib/mixins/TemplMgmt.js';
import {CE} from '../lib/CE.js';

export interface DTRCounterProps {
    count: number;
} 


const ce = new CE<DTRCounterProps & TemplMgmtProps, TemplMgmtActions>({
    config:  {
        tagName:'dtr-counter',
        actions:{
            ...beTransformed,
        },
        propDefaults:{
            count: 30,
            hydratingTransform: {
                buttonElements: [{}, {click:{
                    prop:'count',
                    vft: 'dataset.d',
                    plusEq: true,
                    parseValAs: 'int',
                }}]
            },
            transform: {
                countPart: '.count.toLocaleString|'
            },
            mainTemplate: String.raw `<button part=down data-d=-1>-</button><span part=count></span><button part=up data-d=1>+</button>`,
            styles: String.raw `
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
`
        },
        
    },
    mixins: [TemplMgmt],
});