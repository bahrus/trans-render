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
    maxOfAgeAndAgeChangeCount: number,
}

interface IMoodStoneETs{
    myInput: HTMLInputElement
}

interface IMoodStoneActions{
    incAge(self: this): Partial<IMoodStoneProps>
    handleInput(self: this, e: Event): Partial<IMoodStoneProps>
}
const calcAgePlus10: PropsToPartialProps<IMoodStoneProps> = ({age}: IMoodStoneProps) => ({agePlus10: age + 10});

const max = (a: number, b : number) => Math.max(a, b);

export class MoodStone extends O implements IMoodStoneActions {
    static override config: OConfig<IMoodStoneProps & IMoodStoneETs, IMoodStoneActions, IMoodStoneETs> = {
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
            },
            maxOfAgeAndAgeChangeCount:{
                type: 'Number',
                ro: true,
            }
        },
        // onsets:{
        //     isHappy_to_incAge: 1
        // },
        infractions: [calcAgePlus10],
        actions:{
            // incAge: {
            //     ifAllOf: 'isHappy',
            // }
        },
        compacts:{
            negate_isHappy_to_isNotHappy: 0,
            pass_length_of_data_to_dataLength: -1,
            echo_dataLength_to_echoLength: 20,
            on_change_of_age_toggle_ageChangeCount: 0,
            when_isHappy_changes_invoke_incAge: 0,

        },
        handlers: {
            myInput_to_handleInput_on: 'change'
        },
        positractions: [
            {
                do: max,
                ifKeyIn: ['age', 'ageChangeCount'],
                //pass: ['age', 'ageChangeCount'],
                assignTo: ['maxOfAgeAndAgeChangeCount']
            }
        ]

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

customElements.define('mood-stone', MoodStone);