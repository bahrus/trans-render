import { Transform } from '../Transform.js';
const model = {
    isHappy: false,
    handleChange: (e, { model, propagator }) => {
        model.isHappy = !model.isHappy;
        propagator?.dispatchEvent(new Event('isHappy'));
    }
};
const form = document.querySelector('form');
const propagator = new EventTarget();
Transform(form, model, {
    input: {
        a: {
            on: 'change',
            do: (e, { model, propagator }) => {
                model.isHappy = !model.isHappy;
                propagator?.dispatchEvent(new Event('isHappy'));
            }
        }
    },
    span: 'isHappy'
}, propagator);
