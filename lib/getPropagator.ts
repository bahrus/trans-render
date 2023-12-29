export async function getPropagator(host: EventTarget){
    if( (<any>host)._isPropagating) return host;
    if(!(host instanceof Element)) throw 'NI';
    await customElements.whenDefined(host.localName);
    return (<any>host).xtalState || (<any>host.constructor)?.ceDef?.services?.propper?.stores?.get(host) as EventTarget
}