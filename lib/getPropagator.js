export async function getPropagator(host) {
    if (host._isPropagating)
        return host;
    if (!(host instanceof Element))
        throw 'NI';
    await customElements.whenDefined(host.localName);
    return host.constructor?.ceDef?.services?.propper?.stores?.get(host);
}
