// 单次非阻塞循环
function loopSingle(S, E, func, callback) {
    var loop = function () {
        if (S == E) {
            callback();
            return;
        }
        func(S++);
        window.setTimeout(loop, 0);
    }
    window.setTimeout(loop, 0);
}

function analyze(size, mat) {
    var num = 0,
        label = 0;
    for (var i = 0; i < size; i++) {
        if (mat.data[i][0] > num) {
            num = mat.data[i][0];
            label = i;
        }
    }
    return label;
}

function appendTrainLog(str) {
    vm.trainData.log += str;
    $('#trainLog').scrollTop($('#trainLog').prop("scrollHeight"));
}

function clearTrainLog() {
    vm.trainData.log = "";
}

function appendTestLog(str) {
    vm.testData.log += str;
    $('#testLog').scrollTop($('#testLog').prop("scrollHeight"));
}

function clearTestLog() {
    vm.testData.log = "";
}

function genInputsTargets(record) {
    var targets = MatZeros(vm.property.onodes, 1).apply((x) => 0.01);
    var inputs = [];

    for (var i = 1; i < record.length; i++)
        inputs.push(record[i]);
    inputs = new Matrix([inputs]).apply((x) => ((x / 255.0) * 0.99 + 0.01));
    targets.data[record[0]][0] = 0.99;

    return {
        inputs: inputs.T,
        targets: targets
    };
}

function sum(arr) {
    var ans = 0;
    for (var i = 0; i < arr.length; i++)
        ans += arr[i];
    return ans;
}

function changeTwoDecimal(x) {
    var f_x = parseFloat(x);
    if (isNaN(f_x)) {
        return 0;
    }
    var f_x = Math.round(x * 100) / 100;
    var s_x = f_x.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2) {
        s_x += '0';
    }
    return s_x;
}