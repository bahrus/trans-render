export function freeze(content, beHive) {
    const decoratorElements = Array.from(beHive.children);
    for (const decorEl of decoratorElements) {
        const ifWantsToBe = decorEl.getAttribute('if-wants-to-be');
        if (ifWantsToBe === undefined)
            continue;
        const isAttr = 'is-' + ifWantsToBe;
        const beAttr = 'be-' + ifWantsToBe;
        const converted = Array.from(content.querySelectorAll(`[${isAttr}]`));
        for (const el of converted) {
            const attr = el.getAttribute(isAttr);
            el.removeAttribute(isAttr);
            el.setAttribute(beAttr, attr);
        }
    }
}
