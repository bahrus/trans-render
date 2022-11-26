import { mse } from './const.js';
import { Svc } from './Svc.js';
export class PropRegistry extends Svc {
    args;
    constructor(args) {
        super();
        this.args = args;
        args.definer.addEventListener(mse, () => {
            this.#do(args);
        }, { once: true });
    }
    async #do(args) {
        const config = args.config;
        const props = {};
        const defaults = { ...args.complexPropDefaults, ...config.propDefaults };
        const nonDryProps = new Set();
        for (const key in defaults) {
            const prop = { ...defaultProp };
            this.#setType(prop, defaults[key]);
            props[key] = prop;
        }
        const explicitProps = config.propInfo;
        if (explicitProps !== undefined) {
            for (const key in explicitProps) {
                if (props[key] === undefined) {
                    const prop = { ...defaultProp };
                    props[key] = prop;
                }
                const prop = props[key];
                Object.assign(prop, explicitProps[key]);
                if (!prop.dry)
                    nonDryProps.add(key);
            }
        }
        const actions = config.actions;
        if (actions !== undefined) {
            for (const methodName in actions) {
                const action = actions[methodName];
                const upon = this.getPropsFromAction(action);
                for (const dependency of upon) {
                    if (props[dependency] === undefined) {
                        const prop = { ...defaultProp };
                        props[dependency] = prop;
                    }
                }
            }
        }
        this.nonDryProps = nonDryProps;
        this.propInfos = props;
        this.allPropNames = Object.keys(props);
        // const {services} = args;
        // const {definer} = services!;
        // definer.addEventListener(acb, async e => {
        //     const acbE = (e as CustomEvent).detail as IAttrChgCB;
        //     const {instance, name, newVal, oldVal} = acbE;
        //     const {parse} = await import('./parse.js');
        //     await args.definer!.resolveInstanceSvcs(args, instance);
        //     await parse(acbE, props, defaults);
        // });
        this.resolved = true;
    }
    #setType(prop, val) {
        if (val !== undefined) {
            if (val instanceof RegExp) {
                prop.type = 'RegExp';
            }
            else {
                let t = typeof (val);
                t = t[0].toUpperCase() + t.substr(1);
                prop.type = t;
            }
        }
    }
    async getAttrNames(ext) {
        const returnArr = ext.observedAttributes || [];
        const { propInfos } = this;
        const { camelToLisp } = await import('../lib/camelToLisp.js');
        for (const key in propInfos) {
            const prop = propInfos[key];
            if (prop.parse) {
                returnArr.push(camelToLisp((key)));
            }
        }
        returnArr.push('defer-hydration');
        return returnArr;
    }
    #actionToPropMap = new Map();
    getPropsFromAction(action) {
        const test = this.#actionToPropMap.get(action);
        if (test !== undefined)
            return test;
        const returnObj = typeof (action) === 'string' ? new Set([action]) : new Set([
            ...(action.ifAllOf || []),
            ...(action.ifKeyIn || []),
            ...(action.ifNoneOf || []),
            ...(action.ifEquals || []),
            ...(action.ifAtLeastOneOf || [])
        ]);
        this.#actionToPropMap.set(action, returnObj);
        return returnObj;
    }
}
const defaultProp = {
    type: 'Object',
    dry: true,
    parse: true,
};
