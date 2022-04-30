const xt = require('xtal-test/index');
(async () => {
    const passed = await xt.runTests([
        {
            path: 'test/xtal-editor-test1.html',
            expectedNoOfSuccessMarkers: 1
        }
    ]);
    if (passed) {
        console.log("Tests Passed.  Have a nice day.");
    }
})();

