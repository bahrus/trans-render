const xt = require('xtal-test/index');
(async () => {
    const passed = await xt.runTests([
        {
            path: 'test/example1.html',
            expectedNoOfSuccessMarkers: 1
        }
        // {
        //     path: 'test/fly-init.html',
        //     expectedNoOfSuccessMarkers: 6,
        // },
        // {
        //     path: 'test/fly-transform.html',
        //     expectedNoOfSuccessMarkers: 5,
        // },
        // {
        //     path: 'test/fly-repeat.html',
        //     expectedNoOfSuccessMarkers: 1,
        // },
        // {
        //     path: 'test/fly-repeat2.html',
        //     expectedNoOfSuccessMarkers: 1,
        // },
        // {
        //     path: 'test/fly-nested-repeat.html',
        //     expectedNoOfSuccessMarkers: 1,
        // },
    ]);
    if (passed) {
        console.log("Tests Passed.  Have a nice day.");
    }
})();

