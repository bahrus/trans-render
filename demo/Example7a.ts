import {Transform} from '../Transform.js';
import { RoundaboutReady } from '../ts-refs/trans-render/froop/types.js';

interface Model {
    typeToEdit: string,
}
const model = {
    typeToEdit: 'boolean'
} as Model & RoundaboutReady
const form = document.querySelector('form')!;

Transform<Model>(form, model, {
    input: [
        {o: 'typeToEdit', i: 'boolean', s: {type: 'checkbox', hidden: false}},
        {o: 'typeToEdit', i: 'number',  s: {type: 'number', hidden: false}},
        {o: 'typeToEdit', i: 'object',  s: {hidden: true}}
    ]
});