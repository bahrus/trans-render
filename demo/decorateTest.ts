import {decorate} from '../decorate.js';

const testArr = ['a', 'b', 'c'];

function test(h: HTMLElement){
    decorate<HTMLAnchorElement>(h as HTMLAnchorElement, {
        href: 'hello',
        
        style: {

        },
    } as HTMLAnchorElement)
}