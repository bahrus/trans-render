import { Transform } from '../Transform.js';
const model = {
    isHappy: false,
    handleChange: (e, { model }) => {
        model.isHappy = !model.isHappy;
    }
};
const form = document.querySelector('form');
Transform(form, model, {
    input: {
        a: {
            on: 'change',
            do: 'handleChange'
        }
    },
    span: 'isHappy'
});
