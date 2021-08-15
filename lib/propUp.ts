/**
 * Needed for asynchronous loading
 * @param props Array of property names to "upgrade", without losing value set while element was Unknown
 * @param defaultValues:   If property value not set, set it from the defaultValues lookup
 * @private
 */
export function propUp<T = any>(self: HTMLElement, props: string[], defaultValues?: T){
    props.forEach(prop => {
        let value = (<any>self)[prop];
        if(value === undefined && defaultValues !== undefined){
            value = (<any>defaultValues)[prop];
        }
        if (self.hasOwnProperty(prop)) {
            delete (<any>self)[prop];
        }
        //some properties are read only.
        try{(<any>self)[prop] = value;}catch{}
        
    });
}