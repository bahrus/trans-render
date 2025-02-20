import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    greeting: string,
}
interface Methods{
    
}
const model= {
    greeting: ''
} as Props & Methods & RoundaboutReady;

const div = document.querySelector('div')!;


Transform<Props, Methods>(div, model, {
    "| greeting": {
        y: 0
    }
});

setTimeout(() => {
    model.greeting = 'bye';
}, 2000);