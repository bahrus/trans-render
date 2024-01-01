export class TransRender extends HTMLElement{
    connectedCallback(){
        
    }
}
if(!customElements.get('trans-render')) customElements.define('trans-render', TransRender);