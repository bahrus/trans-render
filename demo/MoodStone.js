import { O } from '../froop/O.js';
const calcAgePlus10 = ({ age }) => ({ agePlus10: age + 10 });
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
            },
            agePlus10: {
                type: 'Number',
                ro: true,
            }
        },
        onsets: {
            isHappy_to_incAge: 1
        },
        infractions: [calcAgePlus10],
        actions: {
        // incAge: {
        //     ifAllOf: 'isHappy',
        // }
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
