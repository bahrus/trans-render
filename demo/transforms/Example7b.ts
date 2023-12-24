import {Transform} from '../../Transform.js';

interface Props {
    typeToEditIsLimited: true,
}
interface Methods{
    isRange: (p: Props) => boolean,
    isUnlimited: (p: Props) => boolean,
}
const model: Props & Methods = {
    typeToEditIsLimited: true,
    isRange: ({typeToEditIsLimited}) => typeToEditIsLimited,
    isUnlimited: ({typeToEditIsLimited}) => !typeToEditIsLimited,
}
const form = document.querySelector('form')!;
const propagator = new EventTarget();

Transform<Props, Methods>(form, model, {
    input: [
        {
            o: 'typeToEditIsLimited', 
            i: {d: 'isRange'},
            s: {type: 'range'}
        },
        {
            o: 'typeToEditIsLimited', 
            i: {d: 'isUnlimited'},
            s: {type: 'number'}
        },
    ]
}, et);