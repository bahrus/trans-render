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
                attrName: 'is-happy',
                parse: true,
            },
            isNotHappy: {
                type: 'Boolean',
                ro: true,
            }
        },
        actions: {
            incAge: {
                ifAllOf: 'isHappy',
            }
        },
        compacts: {
            isHappy_to_isNotHappy: 'negate',
        }
    };
    incAge({ age }) {
        return {
            age: age + 1
        };
    }
}
await MoodStone.bootUp();
customElements.define(MoodStone.config.name, MoodStone);
