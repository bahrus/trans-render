export function beBeckoned(el: Element, once: boolean, callBack: () => void){
    if(el.querySelector('[be-a-beacon],[data-be-a-beacon],[is-a-beacon],[data-is-a-beacon]') !== null){
        callBack();
        if(once) return;
    }
    el.addEventListener('i-am-here', e => {
        callBack();
    }, {capture: true, once});
}