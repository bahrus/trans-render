export function convert(val, parseValAs) {
    if (parseValAs === null)
        return val;
    let ret = val;
    switch (parseValAs) {
        case 'bool':
            ret = val === 'true';
            break;
        case 'int':
            ret = parseInt(val);
            break;
        case 'float':
            ret = parseFloat(val);
            break;
        case 'date':
            ret = new Date(val);
            break;
        case 'truthy':
            ret = !!val;
            break;
        case 'falsy':
            ret = !val;
            break;
        case 'string':
            switch (typeof val) {
                case 'string':
                    ret = val;
                    break;
                case 'object':
                    ret = JSON.stringify(val);
                    break;
            }
            break;
        case 'object':
            switch (typeof val) {
                case 'string':
                    ret = JSON.parse(val);
                    break;
                case 'object':
                    ret = val;
                    break;
            }
    }
    return ret;
}
