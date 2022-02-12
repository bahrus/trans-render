export async function def(MyElementClass: any){
    let tagName = MyElementClass.is as string;
    let n = 0;
    let name = tagName;
    while(true){
        if(n > 0) name = `${tagName}-${n}`;
        const test = customElements.get(name);
        if(test === undefined){
            MyElementClass.isReally = name;
            customElements.define(name, MyElementClass);
            return;
        }else{
            if(test === MyElementClass){
                MyElementClass.isReally = name;
                return;
            }
        }
        n++;
    }
}