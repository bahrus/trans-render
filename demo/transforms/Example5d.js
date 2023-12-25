import { Transform } from '../../Transform.js';
const model = {
    isHappy: false,
    handleInput: (e, { model, propagator }) => {
        model.isHappy = !model.isHappy;
        propagator?.dispatchEvent(new Event('isHappy'));
    }
};
const form = document.querySelector('form');
const propagator = new EventTarget();
Transform(form, model, {
    input: {
        a: ['handleInput', {
                on: 'change',
                do: (e, { model, propagator }) => {
                    model.isHappy = !model.isHappy;
                    propagator?.dispatchEvent(new Event('isHappy'));
                }
            }]
    },
    span: 'isHappy'
}, propagator);
