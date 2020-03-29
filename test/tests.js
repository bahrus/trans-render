const xt = require('xtal-test/index');
(async () => {
    const passed = await xt.runTests([
        {
            path: 'test/fly-init.html',
            expectedNoOfSuccessMarkers: 5,
        },
        {
            path: 'test/fly-repeat.html',
            expectedNoOfSuccessMarkers: 1,
        },
    ]);
    if (passed) {
        console.log("Tests Passed.  Have a nice day.");
    }
})();
