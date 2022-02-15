//copied from pass-up initially
export function doSet(recipientElement: any, prop: string, val: any, plusEq: boolean | undefined, toggleProp: boolean | undefined){
    if(plusEq){
        recipientElement[prop] += val;
    }else if(toggleProp){
        recipientElement[prop] = !recipientElement[prop];
    }else{
        recipientElement[prop] = val;
    }
    
}