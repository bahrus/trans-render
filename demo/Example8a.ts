import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    count: number,
}
interface Methods{
    
}
const model = {
    count: 30000,
} as Props & Methods  & RoundaboutReady

const div = document.querySelector('div')!;


Transform<Props, Methods>(div, model, {
    button: {
        m:{
            on: 'click',
            inc: 'count',
            byAmt: '.dataset.d'
        }
    },
    '% count': 0
});