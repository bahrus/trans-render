import { MountOrchestrator } from '../Transform';
import { ForEach, ForEachInterface, QuenitOfWork } from '../types';

export class ForEachImpl implements ForEachInterface{
    #ref: WeakRef<Element>;
    #config: ForEach<any, any, any>;
    #templ: HTMLTemplateElement | undefined ;
    constructor(
        matchingElement: Element,
        public subModel: any[],
        uows: Array<QuenitOfWork<any, any, any>>,
        mo: MountOrchestrator<any, any, any>,
    ){
        this.#ref = new WeakRef(matchingElement);
        const [first] = uows;
        this.#config = first.f!;
    }
    async init(){
        
        const config = this.#config;
        const {clone, xform, appendTo, indexProp} = config;
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
        const templ = this.#templ;
        const instances: Array<Node> = [];
        const {subModel} = this;
        const {Transform} = await import('../Transform.js');
        let cnt = 1;
        for(const item of subModel){
            const instance = templ.content.cloneNode(true) as DocumentFragment;
            for(const child of instance.children){
                (<any>child)[indexProp!] = cnt;
            }
            instances.push(instance);
            await Transform(instance as DocumentFragment, item, xform);
            cnt++;
        }
        const elToAppendTo = matchingElement.querySelector(appendTo!);
        for(const instance of instances){
            elToAppendTo?.appendChild(instance);
        }

    }
    async update(){}
}
