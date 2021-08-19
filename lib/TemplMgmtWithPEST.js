import { TemplMgmtBaseMixin } from './TemplMgmtBase.js';
import { PE } from './PE.js';
import { SplitText } from './SplitText.js';
import { define } from './CE.js';
import { html } from './html.js';
import { doInitTransform, doUpdateTransform, } from './TemplMgmtBase.js';
const TemplMgmtMixin = (superclass) => class TemplMgmt extends TemplMgmtBaseMixin(superclass) {
    loadPlugins(self) {
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
};
export const tm = {
    doInitTransform,
    doUpdateTransform,
    define,
    html,
    TemplMgmtMixin
};
