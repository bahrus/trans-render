import {Transform} from '../Transform.js';

interface Props {
    booleanValue: boolean,
}
interface Methods{
    
}
const model: Props & Methods = {
    booleanValue: false
}
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