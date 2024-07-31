import { MountOrchestrator, Transformer } from '../Transform';
import { ForEach, ForEachInterface, QuenitOfWork } from '../ts-refs/trans-render/types.js'; 

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
        const elToClone = matchingElement.querySelector(clone || 'template');
        if(elToClone instanceof HTMLTemplateElement){
            this.#templ = elToClone;
        }else{
            const templ = document.createElement('template');
            templ.innerHTML = elToClone?.outerHTML!;
            this.#templ = templ;
        }
        

    }
    async update(subModel: any[]){
        //console.log('update');
        const templ = this.#templ!;
        const config = this.#config;
        const matchingElement = this.#ref.deref();
        if(matchingElement === undefined) throw 'NI';
        const {xform, appendTo, indexProp, timestampProp, outOfRangeAction, outOfRangeProp} = config;
        const instances: Array<Node> = [];
        const transformerLookup = new Map<Node, Transformer<any>>();
        const {Transform} = await import('../Transform.js');
        let cnt = 1;
        for(const item of subModel){
            const ithTransformer = this.#transforms.get(cnt - 1);
            if(ithTransformer !== undefined){
                cnt++;
                const {item: i, timeStampVal} = ithTransformer;
                if(outOfRangeProp){
                    const {isOutOfRange, transformers} = ithTransformer;
                    if(isOutOfRange){
                        for(const transformer of transformers){
                            const {target} = transformer;
                            (<any>target)[outOfRangeProp] = false;
                        }
                    }
                }
                if(i === item) {
                    continue;
                }
                if(timestampProp !== undefined){
                    if(timeStampVal === item[timestampProp]){
                        continue;
                    }
                }
                const {transformers} = ithTransformer;
                for(const transformer of transformers){
                    await transformer.updateModel(item);
                }
                
                continue;
            }
            const {getBlowDriedTempl} = await import('../lib/getBlowDriedTempl.js');
            const blowDriedTempl = getBlowDriedTempl(templ);
            const instance = blowDriedTempl.content.cloneNode(true) as DocumentFragment;
            const transformers: Array<Transformer<any>> = [];
            for(const child of instance.children){
                (<any>child)[indexProp!] = cnt;
                const transformer = await Transform(child, item, xform);
                transformers.push(transformer);
            }
            instances.push(instance);
            
            this.#transforms.set(cnt - 1, {
                item,
                transformers,
                timeStampVal: timestampProp !== undefined ? item[timestampProp] : undefined,
            });
            cnt++;
        }
        if(outOfRangeAction !== undefined || outOfRangeProp !== undefined){
            
            let nextTransform = this.#transforms.get(cnt - 1);
            while(nextTransform){
                nextTransform.isOutOfRange = true;
                const {transformers} = nextTransform;
                for(const transformer of transformers){
                    const {target} = transformer;
                    //debugger;
                    if(outOfRangeAction !== undefined){
                        const {getVal} = await import('../lib/getVal.js');
                        await getVal({host: target}, outOfRangeAction);
                    }
                    if(outOfRangeProp){
                        (<any>target)[outOfRangeProp] = true;
                    }
                }
                 
                cnt++;
                nextTransform = this.#transforms.get(cnt - 1);
            }
        }
        
        const elToAppendTo = appendTo !== undefined ?  matchingElement.querySelector(appendTo) : matchingElement;
        for(const instance of instances){
            elToAppendTo?.append(instance);
            //debugger;
        }
    }
}

export interface IthTransform{
    item: any,
    transformers: Array<Transformer<any>>,
    timeStampVal?: any,
    isOutOfRange?: boolean,
}
