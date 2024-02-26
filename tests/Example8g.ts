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
    "| greeting": {
        y: 0
    }
});

