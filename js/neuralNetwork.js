var vm = new Vue({
    el: "#app",
    data: {
        property: {
            inodes: 784,
            hnodes: 200,
            onodes: 10,
            lr: 10, // 学习率，百分之10
            wih: null,
            who: null
        },
        trainData: {
            epoch: 5,
            scale: 50, // 千分之50
            loading: false,
            loaded: false,
            progress: 0,
            log: ""
        },
        testData: {
            scale: 100, // 千分之100
            error: 100,
            percentage: 0,
            loading: false,
            loaded: false,
            progress: 0,
            log: ""
        },
        manualDisplay: 100,
        manualRendered: 0,
        chosenTestNum: 1
    },
    computed: {
        testBtnText: function () {
            if (this.testData.loaded)
                return this.testData.data.length * this.testData.scale / 1000;

            return this.testData.scale + "‰";
        },

        chosenTestMax: function () {
            if (this.testData.loaded)
                return this.testData.data.length;
            return 1;
        },

        chosenTestLabel: function () {
            if (this.testData.loaded)
                return this.testData.data[this.chosenTestNum - 1][0];
            return "";
        }
    },
    watch: {
        manualDisplay: function () {
            var that = this;
            that.$nextTick(function () {
                if (that.testData.loaded) {
                    that.drawExamples(that.manualRendered + 1, that.manualDisplay);
                    that.manualRendered = that.manualDisplay;
                }
            })
        }
    },
    methods: {
        // settings

        jump() {
            window.open("https://blog.xecades.xyz/articles/neuralNetwork");
        },

        // loads
        loadTrainData(file) {
            this.trainData.loading = true;
            var that = this;
            readCSV(file, function (data) {
                that.trainData.data = data;
                $("#trainDataPreview").html(that.trainData.data[0] + "...");
                that.trainData.loading = false;
                that.trainData.loaded = true;
                that.init();
            });
        },

        loadTestData(file) {
            this.testData.loading = true;
            var that = this;
            readCSV(file, function (data) {
                that.testData.data = data;
                $("#testDataPreview").html(that.testData.data[0] + "...");
                that.testData.loading = false;
                that.testData.loaded = true;
                that.init();
                that.drawExamples(1, that.manualDisplay);
                that.handleChosen();
            });
        },

        init() {
            if (this.property.wih == null) {
                this.property.wih = MatRand(this.property.hnodes, this.property.inodes, 1 / Math.sqrt(this.property.inodes));
                this.property.who = MatRand(this.property.onodes, this.property.hnodes, 1 / Math.sqrt(this.property.hnodes));
            }
            this.n = new neuralNetwork(this.property.inodes, this.property.hnodes, this.property.onodes, this.property.lr / 100, this.property.wih, this.property.who);
        },

        // data
        upload(file) {
            var that = this;
            readFile(file, function (obj) {
                that.property.inodes = obj.inodes;
                that.property.hnodes = obj.hnodes;
                that.property.onodes = obj.onodes;

                that.property.lr = obj.lr;

                that.property.wih = obj.wih;
                that.property.who = obj.who;

                that.init();
                $("#uploadDataPreview").html("wih = " + that.property.wih.data[0] + "...\nwho = " + that.property.who.data[0] + "...");
                that.handleChosen();
            });
        },

        saveData() {
            if (this.property.wih == null)
                this.$alert('请至少先加载数据', 'Error:');
            else
                saveFile(JSON.stringify(this.property), "text/latex", "NeuralNetwork.txt");
        },

        // train
        train() {
            if (!this.trainData.loaded) {
                this.$alert('请至少先加载学习数据', 'Error:');
                return null;
            }

            var that = this;
            var size = that.trainData.data.length;
            var progress = 0;
            var loop = size * that.trainData.scale / 1000;

            clearTrainLog();
            appendTrainLog("Start Training Neural Network\n");

            loopSingle(0, that.trainData.epoch * loop, function (x) {
                var epoch = Math.floor(x / loop);
                var rec = x % loop;

                if (rec % 50 == 0)
                    that.handleChosen();
                if (rec % 10 == 0)
                    that.trainData.progress = Math.round(100 * progress / (that.trainData.epoch * loop))
                if (rec % 50 == 0)
                    appendTrainLog("training data #" + rec + " of epoch #" + epoch + "\n");

                var group = genInputsTargets(that.trainData.data[rec]);
                that.n.train(group.inputs, group.targets);

                progress++;
            }, function () {
                appendTrainLog("Finished Training.\n");
                that.trainData.progress = 100;
            });
        },

        // test
        test() {
            if (!this.testData.loaded) {
                this.$alert('请至少先加载测试数据', 'Error:');
                return null;
            }

            var that = this;
            var loop = that.testData.data.length * that.testData.scale / 1000;
            var scorecard = [];

            clearTestLog();
            appendTestLog("Start Testing Neural Network.\n");

            loopSingle(0, loop, function (rec) {
                var record = that.testData.data[rec];
                var inputs = genInputsTargets(record).inputs;

                var queryLabel = analyze(that.property.onodes, that.n.query(inputs));
                var correctLabel = record[0];

                if (rec % 50 == 0)
                    appendTestLog("test #" + rec + ": correct ans is " + correctLabel + ", network's ans is " + queryLabel + ((queryLabel == correctLabel) ? ", correct.\n" : ", wrong.\n"));
                if (rec % 10 == 0)
                    that.testData.progress = Math.round(100 * rec / loop);
                if (rec % 5 == 0 && rec != 0) {
                    that.testData.percentage = 100 * sum(scorecard) / scorecard.length;
                    that.showCorrectPercentage();
                }

                scorecard.push(queryLabel == correctLabel);
            }, function () {
                appendTestLog("Finished Testing.\n");
                appendTestLog("Performance: " + sum(scorecard) / scorecard.length + ".\n");
                appendTestLog("Error ones:");
                var tot = 0;
                for (var i = 1; i <= scorecard.length; i++) {
                    if (!scorecard[i - 1]) {
                        tot++;
                        appendTestLog(" #" + i);
                        if (tot == that.testData.error)
                            break;
                    }
                }
                appendTestLog(", etc.");
                that.testData.progress = 100;
            });
        },

        showCorrectPercentage() {
            var num = vm.testData.percentage;
            gaugeConfig.value = num;
            gaugeConfig.statistic.text = changeTwoDecimal(num);
            gaugePlot.updateConfig(gaugeConfig);
            gaugePlot.render();
        },

        displayTitle(val) {
            var ret = "#" + val;
            if (this.testData.data != undefined) {
                return ret + ' => ' + this.testData.data[val - 1][0];
            }
            return ret;
        },

        run(item) {
            if (this.testData.loaded) {
                var record = this.testData.data[item - 1];
                var inputs = genInputsTargets(record).inputs;
                var label = analyze(this.property.onodes, this.n.query(inputs));
                this.$alert('It is ' + label + '!😀', 'Network says:');
            } else {
                this.$alert('请至少先加载测试数据', 'Error:');
            }
        },

        drawExamples(start, end) {
            var that = this;
            loopSingle(start, end + 1, function (i) {
                var record = that.testData.data[i - 1];
                var inputs = [];

                for (var j = 1; j < record.length; j++)
                    inputs.push(record[j]);

                drawNumber(inputs, "canvas" + i);
            }, function () {});
        },

        loadNewExample() {
            var that = this;
            if (that.testData.loaded) {
                that.manualDisplay = Math.min(that.manualDisplay + 80, that.testData.data.length);
            }
        },

        chosenTest(ignore = false) {
            if (this.testData.loaded) {
                var record = this.testData.data[this.chosenTestNum - 1];
                var inputs = genInputsTargets(record).inputs;
                this.showPlots(this.n.query(inputs));
            } else if (!ignore) {
                this.$alert('请至少先加载测试数据', 'Error:');
            }
        },

        showPlots(mat) {
            var data = [];

            for (var i = 0; i < this.property.onodes; i++) {
                data.push({
                    Number: i,
                    Possibility: mat.data[i][0]
                });
            }

            columnPlot.updateConfig({
                data,
                xField: 'Number',
                yField: 'Possibility',
                height: 400,
                width: $(".detail").width(),
                guideLine: [{
                    type: 'max'
                }]
            });
            columnPlot.render();
        },

        handleChosen() {
            if (this.testData.loaded) {
                var record = this.testData.data[this.chosenTestNum - 1];
                var inputs = [];

                for (var i = 1; i < record.length; i++)
                    inputs.push(record[i]);

                drawNumber(inputs, "chosenTestCanvas", 280);
                this.chosenTest();
            }
        }
    }
});

$(window).resize(function () {
    vm.chosenTest(true);
    vm.showCorrectPercentage();
});

$(document).ready(function () {
    columnData = [{
        Number: 0,
        Possibility: 0
    }];

    gaugeConfig = {
        title: {
            visible: true,
            text: '正确率',
        },
        width: 350,
        height: 350,
        value: 0,
        min: 0,
        max: 100,
        range: [0, 100],
        color: ['l(0) 0:#fff 1:#5f92f9'],
        axis: {
            offset: -15,
            tickLine: {
                visible: true,
                length: 10,
            },
            label: {
                visible: false,
            },
        },
        pivot: {
            visible: true,
            thickness: 10,
        },
        statistic: {
            visible: true,
            position: ['50%', '100%'],
            text: '',
            color: '#2e3033',
            size: 25,
        },
    };

    columnConfig = {
        columnData,
        xField: 'Number',
        yField: 'Possibility',
        height: 400,
        width: $(".detail").width(),
        guideLine: [{
            type: 'max'
        }]
    };

    columnPlot = new G2Plot.Column("plots", columnConfig);
    gaugePlot = new G2Plot.Gauge("percentage", gaugeConfig);

    columnPlot.render();
    gaugePlot.render();
});