function csvToObject(csvString) {
    var csvarry = csvString.split(/[\s\n]/);
    var datas = [];
    for (var i = 0; i < csvarry.length; i++)
        datas.push(csvarry[i].split(",").map(Number));
    return datas;
}

function readCSV(file, callback) {
    if (file.raw) {
        let reader = new FileReader();
        reader.readAsText(file.raw, 'UTF-8');
        reader.onload = function (e) {
            callback(csvToObject(e.target.result));
        }
    }
}

function saveFile(value, type, name) {
    // doSave(JSON.stringify(this.n), "text/latex", "NeuralNetwork.txt");

    var blob;
    if (typeof window.Blob == "function") {
        blob = new Blob([value], {
            type: type
        });
    } else {
        var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
        var bb = new BlobBuilder();
        bb.append(value);
        blob = bb.getBlob(type);
    }

    var URL = window.URL || window.webkitURL;
    var bloburl = URL.createObjectURL(blob);
    var anchor = document.createElement("a");

    if ('download' in anchor) {
        anchor.style.visibility = "hidden";
        anchor.href = bloburl;
        anchor.download = name;
        document.body.appendChild(anchor);
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        anchor.dispatchEvent(evt);
        document.body.removeChild(anchor);
    } else if (navigator.msSaveBlob)
        navigator.msSaveBlob(blob, name);
    else
        location.href = bloburl;
}

function readFile(file, callback) {
    if (file.raw) {
        let reader = new FileReader();
        reader.readAsText(file.raw, 'UTF-8');
        reader.onload = function (e) {
            callback(JSON.parse(e.target.result));
        }
    }
}