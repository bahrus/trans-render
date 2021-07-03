import {PSettings} from './types.d.js';
export function applyP<T extends Partial<HTMLElement> = HTMLElement>(target: T, p: PSettings<T>) {
    const props = p[0];
    if (props !== undefined) {
        const safeProps = {...props} as any;
        const readOnlyPrimitives = ['localName', 'tagName'];
        const readOnlyObjects = ['dataset', 'style'];
        const attributes = props.attributes
        if(attributes !== undefined){
            if(attributes instanceof NamedNodeMap){
                for(const attrib of attributes){
                    target.setAttribute!(attrib.name, attrib.value);
                }
                readOnlyObjects.push('attributes');
            }else{
                safeProps['_attributes'] = attributes;
                readOnlyPrimitives.push('attributes');
            }
        }
        for(const prop of readOnlyPrimitives){
            const val = safeProps[prop];
            delete safeProps[prop];
            safeProps['_' + prop] = val;
        }
        for(const prop of readOnlyObjects){
            delete safeProps[prop];
        }       
        Object.assign(target, safeProps);
        if (props.style !== undefined) Object.assign(target.style, props.style);
        if (props.dataset !== undefined) Object.assign(target.dataset, props.dataset);
    }
}