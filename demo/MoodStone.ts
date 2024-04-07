import {O} from '../froop/O.js';
import { Infractions, OConfig, PropsToPartialProps } from '../froop/types.js';

interface IMoodStoneProps{
    isHappy: boolean,
    age: number,
    isNotHappy: boolean,
    agePlus10: number,
}

interface IMoodStoneActions{
    incAge(self: this): Partial<IMoodStoneProps>
}
const calcAgePlus10: PropsToPartialProps<IMoodStoneProps> = ({age}: IMoodStoneProps) => ({agePlus10: age + 10});

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
            },
            agePlus10: {
                type: 'Number',
                ro: true,
            }
        },
        onsets:{
            isHappy_to_incAge: 1
        },
        infractions: [calcAgePlus10],
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