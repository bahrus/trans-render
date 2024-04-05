import {O} from '../froop/O.js';
import { WCConfig, PropInfo, Action } from '../froop/types.js';

interface IMoodStoneProps{
    isHappy: boolean,
}
export class MoodStone extends O {
    static override config: WCConfig<IMoodStoneProps> = {
        name: 'mood-stone',
        propInfo:{
            isHappy: {
                def: true,
                ro: true,
            }
        }
    }
}

MoodStone.bootUp();

customElements.define(MoodStone.config.name!, MoodStone);