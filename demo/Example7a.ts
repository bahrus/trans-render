import {Transform} from '../Transform.js';

interface Model {
    typeToEdit: string,
}
const model = {
    typeToEdit: 'boolean'
}
const form = document.querySelector('form')!;

Transform<Model>(form, model, {
    input: [
        {o: 'typeToEdit', i: 'boolean', s: {type: 'checkbox', hidden: false}},
        {o: 'typeToEdit', i: 'number',  s: {type: 'number', hidden: false}},
        {o: 'typeToEdit', i: 'object',  s: {hidden: true}}
    ]
});