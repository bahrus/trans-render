//very similar to be-observant.getElementToObserve
export async function getRecipientElement(self, { toClosest, toNearestUpMatch, to, toSelf, tocoho, toUpShadow }) {
    let recipientElement = null; // (<any>self).recipientElement;
    //if(recipientElement) return recipientElement;
    if (to || toUpShadow) {
        const { upShadowSearch } = await import('./upShadowSearch.js');
        recipientElement = upShadowSearch(self, (to || toUpShadow));
    }
    else if (toClosest !== undefined) {
        recipientElement = self.closest(toClosest);
        if (recipientElement !== null && toNearestUpMatch) {
            const { upSearch } = await import('./upSearch.js');
            recipientElement = upSearch(recipientElement, toNearestUpMatch);
        }
    }
    else if (toNearestUpMatch !== undefined) {
        const { upSearch } = await import('./upSearch.js');
        recipientElement = upSearch(self, toNearestUpMatch);
    }
    else if (toSelf) {
        recipientElement = self;
    }
    else {
        const { getHost } = await import('./getHost.js');
        recipientElement = getHost(self, tocoho);
    }
    //(<any>self).recipientElement = recipientElement;
    return recipientElement;
}
