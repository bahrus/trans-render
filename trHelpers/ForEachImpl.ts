import { MountOrchestrator, Transformer } from '../Transform';
import { ForEach, ForEachInterface, QuenitOfWork } from '../types';

export const forEachImpls = new WeakMap<Element, ForEachInterface>();
export class ForEachImpl implements ForEachInterface{
    #ref: WeakRef<Element>;
    #config: ForEach<any, any, any>;
    #templ: HTMLTemplateElement | undefined ;
    #transforms: Map<number, IthTransform> = new Map();
    constructor(
        matchingElement: Element,
        //public subModel: any[],
        uows: Array<QuenitOfWork<any, any, any>>,
        mo: MountOrchestrator<any, any, any>,
    ){
        this.#ref = new WeakRef(matchingElement);
        const [first] = uows;
        this.#config = first.f!;
    }
    async init(){
        const config = this.#config;
        const {clone} = config;
        const matchingElement = this.#ref.deref();
        if(matchingElement === undefined) return;
        const elToClone = matchingElement.querySelector(clone!);
        if(elToClone instanceof HTMLTemplateElement){
            this.#templ = elToClone;
        }else{
            const templ = document.createElement('template');
            templ.innerHTML = elToClone?.outerHTML!;
            this.#templ = templ;
        }
        

    }
    async update(subModel: any[]){
        console.log('update');
        const templ = this.#templ!;
        const config = this.#config;
        const matchingElement = this.#ref.deref();
        if(matchingElement === undefined) throw 'NI';
        const {xform, appendTo, indexProp} = config;
        const instances: Array<Node> = [];
        const {Transform} = await import('../Transform.js');
        let cnt = 1;
        for(const item of subModel){
            const ithTransformer = this.#transforms.get(cnt - 1);
            if(ithTransformer !== undefined){
                
                const {item} = ithTransformer;
                if(item === item) {
                    cnt++;
                    continue;
                }
            }
            const instance = templ.content.cloneNode(true) as DocumentFragment;
            for(const child of instance.children){
                (<any>child)[indexProp!] = cnt;
            }
            instances.push(instance);
            const transformer = await Transform(instance as DocumentFragment, item, xform);
            this.#transforms.set(cnt - 1, {
                item,
                transformer,
            });
            cnt++;
        }
        const elToAppendTo = matchingElement.querySelector(appendTo!);
        for(const instance of instances){
            elToAppendTo?.appendChild(instance);
        }
    }
}

export interface IthTransform{
    item: any,
    transformer: Transformer<any, any, any>,

}
