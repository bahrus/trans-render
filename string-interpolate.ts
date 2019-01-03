export function interpolate(s: string, obj: any){
    const split = s.split('|');
    split.forEach((sub, idx)  =>{
        if(sub.startsWith('.')){
            split[idx] = obj[sub.substr(1)];
        }
    });
    return split.join('');
}