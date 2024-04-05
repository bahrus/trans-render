import {O} from '../froop/O.js';
import { WCConfig, PropInfo, Action } from '../froop/types.js';

export class MoodStone extends O {
    static override config: WCConfig<any, any, PropInfo, Action<any, any>> = {
        name: 'mood-stone'
    }
}

customElements.define(MoodStone.config.name!, MoodStone);