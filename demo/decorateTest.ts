import {decorate} from '../decorate.js';

const testArr = ['a', 'b', 'c'];

function test(h: HTMLElement){
    decorate<HTMLAnchorElement>(h as HTMLAnchorElement, {
        propVals:{
            href: 'hello',
            style: {},
        }
        
        
    } )
}