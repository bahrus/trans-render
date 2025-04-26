import {Scope} from '../../froop/Scope.js';
import { IshConfig } from '../../ts-refs/trans-render/froop/types.js';

interface Props {
    ishList: Array<any>
}

interface Actions {
    //disp(self: Props): void;
}
export class MyElement extends Scope<Props> implements Actions {
    static config : IshConfig<Props, Actions> = {
        propInfo: {
            ishList: {},
        },
        compacts: {
            //when_ishList_changes_call_disp: 0,
            when_ishList_changes_dispatch: 'ishListChanged',
        }
    }
    // disp(self: Props): void {
    //     this.dispatchEvent(new Event('ishListChanged'));
    // }
}

MyElement.bootUp();
customElements.define('my-element', MyElement);