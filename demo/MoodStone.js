import { O } from '../froop/O.js';
export class MoodStone extends O {
    static config = {
        name: 'mood-stone',
        propDefaults: {
            age: 22,
        },
        propInfo: {
            isHappy: {
                def: true,
                ro: true,
                attrName: 'is-happy',
                parse: true,
            }
        }
    };
}
await MoodStone.bootUp();
customElements.define(MoodStone.config.name, MoodStone);
