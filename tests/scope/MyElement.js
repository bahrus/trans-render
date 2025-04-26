import { Scope } from '../../froop/Scope.js';
export class MyElement extends Scope {
    static config = {
        propInfo: {
            ishList: {
                def: [{
                        name: 'default',
                        value: [],
                    }]
            },
        },
        compacts: {
            when_ishList_changes_dispatch: 'ishListChanged',
        }
    };
}
MyElement.bootUp();
customElements.define('my-element', MyElement);
