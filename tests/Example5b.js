import { Transform } from '../Transform.js';
const model = {
    isHappy: false,
    handleInput: (e, { model }) => {
        model.isHappy = !model.isHappy;
    }
};
const form = document.querySelector('form');
Transform(form, model, {
    input: {
        a: 'handleInput'
    },
    span: 'isHappy'
});
