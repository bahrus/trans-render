import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Props {
    typeToEdit: string,
}
interface Methods{
    
}
const model = {
    typeToEdit: 'boolean',
} as Props & Methods & RoundaboutReady;

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