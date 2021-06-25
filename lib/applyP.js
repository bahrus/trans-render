export function applyP(target, p) {
    const props = p[0];
    if (props !== undefined) {
        const safeProps = Object.assign({}, props);
        const readOnlyProps = ['dataset', 'style', 'localName', 'tagName', 'attributes'];
        for (const prop of readOnlyProps) {
            const val = safeProps[prop];
            delete safeProps[prop];
            safeProps['_' + prop] = val;
        }
        Object.assign(target, safeProps);
        if (props.style !== undefined)
            Object.assign(target.style, props.style);
        if (props.dataset !== undefined)
            Object.assign(target.dataset, props.dataset);
    }
}
