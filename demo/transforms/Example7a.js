import { Transform } from '../../Transform.js';
const model = {
    typeToEdit: 'boolean'
};
const form = document.querySelector('form');
const propagator = new EventTarget();
Transform(form, model, {
    input: [
        { o: 'typeToEdit', i: 'boolean', s: { type: 'checkbox', hidden: false } },
        { o: 'typeToEdit', i: 'number', s: { type: 'number', hidden: false } },
        { o: 'typeToEdit', i: 'object', s: { hidden: true } }
    ]
}, et);
