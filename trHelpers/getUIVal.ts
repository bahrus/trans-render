export function getUIVal(el: Element){
    if('checked' in el && el instanceof HTMLInputElement && el.type === 'checkbox') return el.checked;
    if(el.hasAttribute('aria-checked')) return el.getAttribute('aria-checked') === 'true';
    if('valueAsNumber' in el && el instanceof HTMLInputElement && el.type ==='number') return el.valueAsNumber;
    if('valueAsDate' in el && el instanceof HTMLInputElement && el.type === 'date') return el.valueAsDate;
    if('value' in el) return el.value;
    if('href' in el) return el.href;
    return el.textContent;
}