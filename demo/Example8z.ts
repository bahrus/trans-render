import {Transform} from '../Transform.js';

interface Props {
    count: number,
}
interface Parts{
    up?: 0
}
interface Methods{
    
}
const model: Props & Methods = {
    count: 30000,
}
const div = document.querySelector('div')!;


Transform<Props & Parts, Methods>(div, model, {
    '% up': {
        m:{
            on: 'click',
            inc: 'count',
            byAmt: '.dataset.d'
        }
    }
});