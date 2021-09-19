import {PSettings} from './types.d.js';
export function applyP<T extends Partial<HTMLElement> = HTMLElement>(target: T, p: PSettings<T>) {
    const props = p[0];
    if (props !== undefined) {
        const safeProps = {...props} as any;
        const renameProps = ['localName', 'tagName'];
        const attributes = props.attributes
        if(attributes !== undefined){
            if(attributes instanceof NamedNodeMap){
                for(const attrib of attributes){
                    target.setAttribute!(attrib.name, attrib.value);
                }
                delete safeProps.attributes;
            }else{
                renameProps.push('attributes');
            }
        }
        const styles = props.style;
        if(styles !== undefined){
            Object.assign(target.style, styles);
            delete safeProps.style;
        }
        const dataset = props.dataset;
        if(dataset !== undefined){
            if(typeof dataset === 'object'){
                Object.assign(target.dataset, dataset);
                delete safeProps.dataset;
            }else{
                renameProps.push('dataset');
            }
        }
        for(const prop of renameProps){
            const val = safeProps[prop];
            if(val===undefined) continue;
            delete safeProps[prop];
            safeProps['_' + prop] = val;
        }
        Object.assign(target, safeProps);

    }
}