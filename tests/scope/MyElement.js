import { Scope } from '../../froop/Scope.js';
export class MyElement extends Scope {
    static config = {
        propInfo: {
            ishList: {},
        },
        compacts: {
            when_ishList_changes_call_disp: 0,
        }
    };
    disp(self) {
        this.dispatchEvent(new Event('ishListChanged'));
    }
}
MyElement.bootUp();
customElements.define('my-element', MyElement);
