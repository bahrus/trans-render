export function getBlowDriedTempl(templ) {
    const refID = templ.dataset.blowDryTemplRef;
    if (refID === undefined)
        return templ;
    return document.getElementById(refID);
}
