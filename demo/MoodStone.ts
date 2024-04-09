import {O} from '../froop/O.js';
import { Infractions, OConfig, PropsToPartialProps } from '../froop/types.js';

interface IMoodStoneProps{
    isHappy: boolean,
    age: number,
    isNotHappy: boolean,
    agePlus10: number,
    data: Array<number>,
    dataLength: number,
    echoLength: number,
    ageChangedToggle: boolean,
    ageChangeCount: number,
}

interface IMoodStoneETs{
    myInput: HTMLInputElement
}

interface IMoodStoneActions{
    incAge(self: this): Partial<IMoodStoneProps>
    handleInput(self: this, e: Event): Partial<IMoodStoneProps>
}
const calcAgePlus10: PropsToPartialProps<IMoodStoneProps> = ({age}: IMoodStoneProps) => ({agePlus10: age + 10});

const max = ([a, b] : [number, number]) => ([a < b]);

export class MoodStone extends O implements IMoodStoneActions {
    static override config: OConfig<IMoodStoneProps & IMoodStoneETs, IMoodStoneActions, IMoodStoneETs> = {
        name: 'mood-stone',
        propDefaults:{
            age: 22,
            data: [1,2, 3, 4, 5]
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
            },
            dataLength: {
                type: 'Number',
                ro: true,
            },
            echoLength:  {
                type: 'Number',
                ro: true,
            },
            ageChangedToggle: {
                type: 'Boolean',
                ro: true,
            },
            ageChangeCount: {
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
            data_to_dataLength: 'length',
            dataLength_to_echoLength: 'echo',
            age_to_ageChangedToggle: 'toggle',
            age_to_ageChangeCount: 'inc',
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