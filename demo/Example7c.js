import { Transform } from '../Transform.js';
const model = {
    typeToEditIsLimited: true,
};
const form = document.querySelector('form');
Transform(form, model, {
    input: [
        {
            o: 'typeToEditIsLimited',
            i: { d: ({ typeToEditIsLimited }) => typeToEditIsLimited },
            s: { type: 'range' }
        },
        {
            o: 'typeToEditIsLimited',
            i: { d: ({ typeToEditIsLimited }) => !typeToEditIsLimited },
            s: { type: 'number' }
        },
    ]
});
