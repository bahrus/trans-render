export function html(strings: TemplateStringsArray, ...keys: string[]) {
    const out: string[]  = [];
    for (let i = 0, ii = strings.length; i < ii; i++) {
        out.push(strings[i]);
        // if we have a variables for it, we need to bind it.
        const ithKey = keys[i];
        if (ithKey !== undefined) {
          out.push(ithKey);
        }
      }
    const templateEl = document.createElement('template');
    templateEl.innerHTML = out.join('');
    return templateEl;
}