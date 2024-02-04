export function getBlowDriedTempl(templ: HTMLTemplateElement){
    const refID = templ.dataset.blowDryTemplRef;
    if(refID === undefined) return templ;
    return document.getElementById(refID) as HTMLTemplateElement;
}