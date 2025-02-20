import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    booleanValue: boolean,
    stringValue: string,
}
interface Methods{
    
}
const model = {
    booleanValue: false,
    stringValue: ''
} as Props & Methods & RoundaboutReady;

const form = document.querySelector('form')!;
Transform<Props, Methods>(form, model, {
    input: {
        m:[
            {
                on: 'focus',
                toggle: 'booleanValue'
            },
            {
                on: 'input',
                s: 'stringValue',
                toValFrom: (matchingElement) => (matchingElement as HTMLInputElement).value.length.toString()
            }
        ]
            
    },
    '. booleanValue': 0,
    '# stringValue': 0,
});