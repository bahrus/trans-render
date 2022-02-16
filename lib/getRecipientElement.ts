import {INotify} from './types';


//very similar to be-observant.getElementToObserve
export async function getRecipientElement(self: Element, {toClosest, toNearestUpMatch, toUpShadow: to, toSelf, tocoho}: INotify){
    let recipientElement: Element | null = null;// (<any>self).recipientElement;
    //if(recipientElement) return recipientElement;
    if(to){
        const {upShadowSearch} = await import('./upShadowSearch.js');
        recipientElement = upShadowSearch(self, to);
    }else if(toClosest !== undefined){
        recipientElement = self.closest(toClosest);
        if(recipientElement !== null && toNearestUpMatch){
            const {upSearch} = await import('./upSearch.js');
            recipientElement = upSearch(recipientElement, toNearestUpMatch) as Element;
        }
    }else if(toNearestUpMatch !== undefined) {
        const {upSearch} = await import('./upSearch.js');
        recipientElement = upSearch(self, toNearestUpMatch) as Element;
    }else if(toSelf){
        recipientElement = self;
    }else{
        const {getHost} = await import('./getHost.js');
        recipientElement = getHost(self, tocoho); 
    }
    //(<any>self).recipientElement = recipientElement;
    return recipientElement;
}