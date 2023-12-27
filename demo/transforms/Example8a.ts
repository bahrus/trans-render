import {Transform} from '../../Transform.js';

interface Props {
    count: number,
}
interface Methods{
    
}
const model: Props & Methods = {
    count: 30000,
}
const div = document.querySelector('div')!;

const propagator = new EventTarget();

Transform<Props, Methods>(div, model, {
    button: {
        m:{
            on: 'click',
            inc: 'count',
            byAmt: '.dataset.d'
        }
    },
    '% count': 0
}, propagator);