import {Transform} from '../Transform.js';

interface Props {
    greeting: string,
}
interface Methods{
    
}
const model: Props & Methods = {
    greeting: ''
}

const div = document.querySelector('div')!;


Transform<Props, Methods>(div, model, {
    span: {
        m:{
            on: 'load',
            s: 'greeting',
            toValFrom: 'textContent'
        }
    },
    "! greeting": 0
});