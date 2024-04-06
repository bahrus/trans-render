import {O} from '../froop/O.js';
import { WCConfig, PropInfo, Action } from '../froop/types.js';

interface IMoodStoneProps{
    isHappy: boolean,
    age: number,
}
export class MoodStone extends O {
    static override config: WCConfig<IMoodStoneProps> = {
        name: 'mood-stone',
        propDefaults:{
            age: 22,
        },
        propInfo:{
            isHappy: {
                def: true,
                ro: true,
                attrName: 'is-happy',
                parse: true,
            }
        }
    }
}

await MoodStone.bootUp();

customElements.define(MoodStone.config.name!, MoodStone);