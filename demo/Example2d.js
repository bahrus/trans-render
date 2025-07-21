import { Transform } from '../Transform.js';
const itemscope = document.querySelector('[itemscope]');
const model = {
    greeting: 'hello'
};
Transform(itemscope, model, {
    '| greeting': 0
});
setTimeout(() => {
    const span = document.createElement('span');
    span.setAttribute('itemprop', 'greeting');
    itemscope.appendChild(span);
    const childScope = itemscope.querySelector('[itemscope]');
    const anotherSpan = document.createElement('span');
    anotherSpan.setAttribute('itemprop', 'greeting');
    childScope.appendChild(anotherSpan);
}, 1000);
setTimeout(() => {
    model.greeting = 'bye';
}, 2000);
