import {Transformer} from '../types';
export class Join{
    constructor(public transformer: Transformer, fragment: DocumentFragment){
        const childElements = Array.from(fragment.children);
        for(const el of childElements){
            el.addEventListener('transform-join', async e => {
                const {target} = e;
                await transformer.transform([target as Element]);
                transformer.flushCache();
            });
        }
    }
}