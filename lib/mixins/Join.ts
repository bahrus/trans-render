import {Transformer, TransformJoinEvent} from '../types';
export class Join{
    constructor(public transformer: Transformer, fragment: DocumentFragment){
        const childElements = Array.from(fragment.children);
        for(const el of childElements){
            el.addEventListener('transform-join', async e => {
                const {detail} = (e as CustomEvent);// as TransformJoinEvent;
                if(detail !== undefined){
                    const {match} = detail as TransformJoinEvent;
                    if(match !== undefined){
                        Object.assign(transformer.ctx, match);
                    }
                }
                const {target} = e;
                await transformer.transform([target as Element]);
                transformer.flushCache();
            });
        }
    }
}