import {O} from '../froop/O.js';
import { OConfig } from '../froop/types.js';

interface IMoodStoneProps{
    isHappy: boolean,
    age: number,
    isNotHappy: boolean,
}

interface IMoodStoneActions{
    incAge(self: this): Partial<IMoodStoneProps>
}
export class MoodStone extends O implements IMoodStoneActions {
    static override config: OConfig<IMoodStoneProps, IMoodStoneActions> = {
        name: 'mood-stone',
        propDefaults:{
            age: 22,
        },
        propInfo:{
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
        onsets:{
            isHappy_to_incAge: 1
        },
        actions:{
            // incAge: {
            //     ifAllOf: 'isHappy',
            // }
        },
        compacts:{
            isHappy_to_isNotHappy: 'negate',

        }
    }
    incAge({age}: this): Partial<IMoodStoneProps> {
        return {
            age: age + 1
        } as Partial<IMoodStoneProps>
    }
}

export interface MoodStone extends IMoodStoneProps{}

await MoodStone.bootUp();

customElements.define(MoodStone.config.name!, MoodStone);