import { acb, npb, mse } from './const.js';
import { ReslvSvc } from './ReslvSvc.js';
export class PropRegistry extends ReslvSvc {
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
            //const {getProps} = await import('../froop/getProps.js')
            for (const methodName in actions) {
                const action = actions[methodName];
                //const typedAction = (typeof action === 'string') ? {ifAllOf:[action]} as Action : action! as Action;
                const upon = this.getPropsFromAction(action);
                for (const dependency of upon) {
                    if (props[dependency] === undefined) {
                        const prop = { ...defaultProp };
                        props[dependency] = prop;
                    }
                }
            }
        }
        //await this.api(args, props);
        this.nonDryProps = nonDryProps;
        this.propInfos = props;
        this.allPropNames = Object.keys(props);
        const { services } = args;
        const { definer: createCustomEl, propify: addProps, hooker: connectActions } = services;
        createCustomEl.addEventListener(acb, async (e) => {
            const acbE = e.detail;
            const { instance, name, newVal, oldVal } = acbE;
            const { parse: doAttr } = await import('./parse.js');
            await doAttr(acbE, props, defaults);
        });
        addProps.addEventListener(npb, async (e) => {
            const inpb = e.detail;
            const { instance } = inpb;
            // if(connectActions){
            //     await connectActions.instanceResolve(instance);
            // }
            //console.log('doPropUp');
            await args.definer.resolveInstanceSvcs(args, instance);
            this.#propUp(instance, this.allPropNames, defaults);
        });
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
    /**
     * Needed for asynchronous loading
     * @param props Array of property names to "upgrade", without losing value set while element was Unknown
     * @param defaultValues:   If property value not set, set it from the defaultValues lookup
     * @private
     */
    #propUp(instance, props, defaultValues) {
        for (const prop of props) {
            let value = instance[prop];
            if (value === undefined && defaultValues !== undefined) {
                value = defaultValues[prop];
            }
            if (instance.hasOwnProperty(prop)) {
                delete instance[prop];
            }
            //some properties are read only.
            try {
                instance[prop] = value;
            }
            catch { }
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
