import { O } from '../froop/O.js';
export class MoodStone extends O {
    static config = {
        name: 'mood-stone',
        propInfo: {
            isHappy: {
                def: true,
                ro: true,
            }
        }
    };
}
MoodStone.bootUp();
customElements.define(MoodStone.config.name, MoodStone);
