import {Transform} from '../../Transform.js';

interface Props {
    typeToEditIsLimited: true,
}
interface Methods{
    
}
const model: Props & Methods = {
    typeToEditIsLimited: true,
}
const form = document.querySelector('form')!;
const propagator = new EventTarget();

Transform<Props, Methods>(form, model, {
    input: [
        {
            o: 'typeToEditIsLimited', 
            i: {d: ({typeToEditIsLimited}) => typeToEditIsLimited},
            s: {type: 'range'}
        },
        {
            o: 'typeToEditIsLimited', 
            i: {d: ({typeToEditIsLimited}) => !typeToEditIsLimited},
            s: {type: 'number'}
        },
    ]
}, et);