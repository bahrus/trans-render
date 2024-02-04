import {Transform} from '../Transform.js';

interface Props {
    typeToEdit: string,
}
interface Methods{
    
}
const model: Props & Methods = {
    typeToEdit: 'boolean',
}
const div = document.querySelector('div')!;

Transform<Props, Methods>(div, model, {
    template: [
        {o: 'typeToEdit', i: 'boolean', s: {hidden: false}},
        {o: 'typeToEdit', i: 'number',  s: {hidden: true}},
        // {o: 'typeToEdit', i: 'object',  s: {hidden: true}}
    ]
});

setTimeout(() => {
    model.typeToEdit = 'number';
}, 2000);