import {RenderContext} from './types';
export async function propSum({
    rhs, target, host
}: RenderContext){
    console.log({rhs});
    const sum = (rhs.sum as number[]).reduce((total, prop) => {
        total += host[prop];
        return total;
    }, 0);
    const to = rhs.to || 'textContent';
    (<any>target)![to] = sum;
}