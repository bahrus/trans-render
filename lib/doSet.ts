//copied from pass-up initially
export function doSet(recipientElement: any, prop: string, val: any, plusEq: boolean | string | number | undefined, toggleProp: boolean | undefined){
    if(plusEq !== undefined){
        if(plusEq === true){
            recipientElement[prop] += val;
        }else{
            recipientElement[prop] += plusEq;
        }
        
    }else if(toggleProp){
        recipientElement[prop] = !recipientElement[prop];
    }else{
        recipientElement[prop] = val;
    }
    
}