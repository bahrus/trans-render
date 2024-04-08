import { O } from '../froop/O.js';
const calcAgePlus10 = ({ age }) => ({ agePlus10: age + 10 });
export class MoodStone extends O {
    static config = {
        name: 'mood-stone',
        propDefaults: {
            age: 22,
            data: [1, 2, 3, 4, 5]
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
            },
            myInput: {
                type: 'Object'
            },
            dataLength: {
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
            data_to_dataLength: 'length',
        },
        handlers: {
            myInput_to_handleInput_on: 'change'
        }
    };
    incAge({ age }) {
        return {
            age: age + 1
        };
    }
    handleInput({ age }, { target }) {
        return {
            age: age + target.value.length
        };
    }
    async connectedCallback() {
        await super.connectedCallback();
        this.myInput = this.querySelector('input');
    }
}
await MoodStone.bootUp();
customElements.define(MoodStone.config.name, MoodStone);
