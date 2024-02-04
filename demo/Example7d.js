import { Transform } from '../Transform.js';
const model = {
    typeToEdit: 'boolean',
};
const div = document.querySelector('div');
Transform(div, model, {
    template: [
        { o: 'typeToEdit', i: 'boolean', s: { hidden: false } },
        { o: 'typeToEdit', i: 'number', s: { hidden: true } },
        // {o: 'typeToEdit', i: 'object',  s: {hidden: true}}
    ]
});
setTimeout(() => {
    model.typeToEdit = 'number';
}, 2000);
