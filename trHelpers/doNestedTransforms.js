import { Transform } from '../Transform.js';
export async function doNestedTransforms(matchingElement, uows, mo) {
    console.log({ uows, mo });
    const { queryInfo, transformer } = mo;
    const { prop } = queryInfo;
    const { model } = transformer;
    const subModel = model[prop];
    for (const uow of uows) {
        const newUOW = { ...uow };
        delete newUOW.q;
        await Transform(matchingElement, subModel, newUOW);
    }
}
