/**
 * Needed for asynchronous loading
 * @param props Array of property names to "upgrade", without losing value set while element was Unknown
 * @param defaultValues:   If property value not set, set it from the defaultValues lookup
 * @private
 */
export function propUp(self, props, defaultValues) {
    props.forEach(prop => {
        let value = self[prop];
        if (value === undefined && defaultValues !== undefined) {
            value = defaultValues[prop];
        }
        if (self.hasOwnProperty(prop)) {
            delete self[prop];
        }
        //some properties are read only.
        try {
            self[prop] = value;
        }
        catch { }
    });
}
