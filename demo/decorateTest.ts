import {decorate} from '../decorate.js';
function test(h: HTMLElement){
    decorate<HTMLAnchorElement>(h as HTMLAnchorElement, {
        href: 'hello',
        style: {

        },
    } as HTMLAnchorElement)
}