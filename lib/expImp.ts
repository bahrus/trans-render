
/**
 * "Expand" HTMLTemplateElement by replacing special tags with referenced templates
 * @param templ 
 * @param templRefs 
 */
export function expImp(templ: HTMLTemplateElement, templRefs: {[key: string]: HTMLTemplateElement}){
    const {content} = templ;
    content.querySelectorAll('[bi]').forEach(bi => {
        const localName = bi.localName;
        const templ = templRefs[localName];
        if(templ === undefined) return;
        const clone = templ.content.cloneNode(true);
        const parentElement = bi.parentElement;
        if(parentElement !== null && bi.nextElementSibling === null){
            parentElement.append(clone);
        }
    });
}