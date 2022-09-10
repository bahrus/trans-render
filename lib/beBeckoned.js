export function beBeckoned(el, once, callBack) {
    if (el.querySelector('[be-a-beacon],[data-be-a-beacon],[is-a-beacon],[data-is-a-beacon]') !== null) {
        callBack();
        if (once)
            return;
    }
    el.addEventListener('i-am-here', e => {
        callBack();
    }, { once });
}
