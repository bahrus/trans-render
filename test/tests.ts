import { IXtalTestRunner, IXtalTestRunnerOptions } from 'xtal-test/index.js';
const xt = require('xtal-test/index') as IXtalTestRunner;


(async () => {
    const passed = await xt.runTests([
        {
            path: 'test/fly-init.html',
            expectedNoOfSuccessMarkers: 6,

        },
        {
            path: 'test/fly-transform.html',
            expectedNoOfSuccessMarkers: 6,

        },
        {
            path: 'test/fly-repeat.html',
            expectedNoOfSuccessMarkers: 1,

        },
        {
            path: 'test/fly-nested-repeat.html',
            expectedNoOfSuccessMarkers: 1,

        },
    ]);
    if(passed){
        console.log("Tests Passed.  Have a nice day.");
    }
})();

