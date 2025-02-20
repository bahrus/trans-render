import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    greeting: string,
}
interface Methods{
    
}
const model = {
    greeting: ''
} as Props & Methods & RoundaboutReady;

const div = document.querySelector('div')!;


Transform<Props, Methods>(div, model, {
    span: {
        m:{
            on: 'load',
            s: 'greeting',
            toValFrom: 'textContent'
        }
    },
    "| greeting": 0
});