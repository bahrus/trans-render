import { Transform } from '../Transform.js';
const model = {
    isHappy: false,
};
const div = document.querySelector('div');
Transform(div, model, {
    '- -some-bool-prop=isHappy': 0
});
