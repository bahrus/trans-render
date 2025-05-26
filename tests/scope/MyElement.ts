import {Scope} from '../../froop/Scope.js';
import { IshConfig } from '../../ts-refs/trans-render/froop/types.js';

interface Props {
    ishList: Array<any>
}

interface Actions {}

export class MyElement extends Scope<Props> implements Actions {
    static config : IshConfig<Props, Actions> = {
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
    }
}

MyElement.bootUp();