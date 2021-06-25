import {PSettings} from './types.d.js';
export function applyP<T extends Partial<HTMLElement> = HTMLElement>(target: T, p: PSettings<T>) {
    const props = p[0];
    if (props !== undefined) {
        const safeProps = Object.assign({}, props) as any;
        const readOnlyProps = ['dataset', 'style', 'localName', 'tagName', 'attributes'];
        for(const prop of readOnlyProps){
            const val = safeProps[prop];
            delete safeProps[prop];
            safeProps['_' + prop] = val;
        }
        Object.assign(target, safeProps);
        if (props.style !== undefined) Object.assign(target.style, props.style);
        if (props.dataset !== undefined) Object.assign(target.dataset, props.dataset);
    }
}