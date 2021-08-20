import { TemplMgmtBaseMixin } from './TemplMgmtBase.js';
import { PE } from './PE.js';
import { SplitText } from './SplitText.js';
import { CE} from './CE.js';
import { html } from './html.js';
import {doInitTransform, } from './TemplMgmtBase.js'; 

export { TemplMgmtBase }  from './TemplMgmtBase.js'; 

const TemplMgmtMixin = (superclass: any) => class TemplMgmt extends TemplMgmtBaseMixin(superclass){
    loadPlugins(self: TemplMgmt){
        self.__ctx = {
            match: self.initTransform,
            host: self,
            postMatch: [
                {
                    rhsType: Array,
                    rhsHeadType: Object,
                    ctor: PE
                },
                {
                    rhsType: Array,
                    rhsHeadType: String,
                    ctor: SplitText
                }
            ],
            options: self.renderOptions,
        };
    }
}

export const tm = {
    doInitTransform,
    //doUpdateTransform,
    CE,
    html,
    TemplMgmtMixin
};