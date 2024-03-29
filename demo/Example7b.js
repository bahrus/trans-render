import { Transform } from '../Transform.js';
const model = {
    typeToEditIsLimited: true,
    isRange: ({ typeToEditIsLimited }) => typeToEditIsLimited,
    isUnlimited: ({ typeToEditIsLimited }) => !typeToEditIsLimited,
};
const form = document.querySelector('form');
Transform(form, model, {
    input: [
        {
            o: 'typeToEditIsLimited',
            i: { d: 'isRange' },
            s: { type: 'range' }
        },
        {
            o: 'typeToEditIsLimited',
            i: { d: 'isUnlimited' },
            s: { type: 'number' }
        },
    ]
});
