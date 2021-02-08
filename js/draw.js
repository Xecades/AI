function drawNumber(mat, item, size=70) {
    var canvas = document.getElementById(item);
    var ctx = canvas.getContext("2d");
    var sSize = size / 28;
    for (var i = 0; i < 28; i++) {
        for (var j = 0; j < 28; j++) {
            var t = 255 - mat[i * 28 + j];
            ctx.fillStyle = "rgb(" + t + "," + t + "," + t + ")";
            ctx.fillRect(j * sSize, i * sSize, sSize, sSize);
        }
    }
}