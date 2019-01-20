const test = {
    //init: init,
    transform: {
        '*': x => ({
            matchNextSib: true,
        }),
        header: x => ({
            matchFirstChild: {
                mark: x => 'hello',
                nav: x => ({
                    matchFirstChild: {
                        a: ({ target }) => {
                            target.href = 'hello';
                            //return {}; //TODO remove with dependency update
                        }
                    }
                })
            },
            inheritMatches: true,
        }),
        main: ({ target }) => {
            //repeatInit(this._value.tags.length, WCInfoTemplate, target);
            return {
                inheritMatches: true,
                matchFirstChild: {}
            };
        }
    }
};
//# sourceMappingURL=Test1.js.map