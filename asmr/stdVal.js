export function stdVal(el) {
    const { localName } = el;
    switch (localName) {
        case 'form':
            throw 'NI';
        case 'input':
            throw 'NI';
        case 'a':
            return el.href;
        case 'data':
            return JSON.parse(el.value);
        default:
            return el.textContent;
    }
}
