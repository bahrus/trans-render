import {O} from '../froop/O.js';
import { Infractions, OConfig, PropsToPartialProps } from '../froop/types.js';

interface IMoodStoneProps{
    isHappy: boolean,
    age: number,
    isNotHappy: boolean,
    agePlus10: number,
}

interface IMoodStoneETs{
    myInput: HTMLInputElement
}

interface IMoodStoneActions{
    incAge(self: this): Partial<IMoodStoneProps>
    handleInput(self: this, e: Event): Partial<IMoodStoneProps>
}
const calcAgePlus10: PropsToPartialProps<IMoodStoneProps> = ({age}: IMoodStoneProps) => ({agePlus10: age + 10});

export class MoodStone extends O implements IMoodStoneActions {
    static override config: OConfig<IMoodStoneProps & IMoodStoneETs, IMoodStoneActions, IMoodStoneETs> = {
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
            },
            myInput: {
                type: 'Object'
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
        },
        handlers: {
            myInput_to_handleInput_on: 'change'
        }
    }
    incAge({age}: this): Partial<IMoodStoneProps> {
        return {
            age: age + 1
        } as Partial<IMoodStoneProps>
    }
    handleInput({age}: this, {target}: Event): Partial<IMoodStoneProps> {
        return {
            age: age + (target as HTMLInputElement).value.length
        }
    }

    override async connectedCallback(): Promise<void> {
        await super.connectedCallback();
        this.myInput = this.querySelector('input') as HTMLInputElement;
    }
}

export interface MoodStone extends IMoodStoneProps{}

export interface MoodStone extends IMoodStoneETs{}

await MoodStone.bootUp();

customElements.define(MoodStone.config.name!, MoodStone);