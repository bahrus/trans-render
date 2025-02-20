import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    booleanValue: boolean,
}
interface Methods{
    
}
const model = {
    booleanValue: false
} as Props & Methods & RoundaboutReady;
const div = document.querySelector('div')!;
Transform<Props, Methods>(div, model, {
    button: {
        m:{
            on: 'click',
            toggle: 'booleanValue'
        }
    },
    '# booleanValue': 0
});