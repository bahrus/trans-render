import { Transform } from '../Transform.js';
const model = {
    typeToEdit: 'boolean',
};
const form = document.querySelector('form');
Transform(form, model, {
    template: [
        { o: 'typeToEdit', i: 'boolean', s: { hidden: false } },
        { o: 'typeToEdit', i: 'number', s: { hidden: true } },
        { o: 'typeToEdit', i: 'object', s: { hidden: true } }
    ]
});
