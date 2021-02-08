class neuralNetwork {
    constructor(inodes, hnodes, onodes, lr, wih, who) {
        this.inodes = inodes;
        this.hnodes = hnodes;
        this.onodes = onodes;

        this.lr = lr;

        this.wih = wih;
        this.who = who;

        this.activation = (x) => (1 / (1 + Math.exp(-x)));
    }

    query(inputs) {
        var hidden = MatDot(this.wih, inputs).apply(this.activation);
        var final = MatDot(this.who, hidden).apply(this.activation);
        return final;
    }

    train(inputs, targets) {
        var hidden = MatDot(this.wih, inputs).apply(this.activation);
        var final = MatDot(this.who, hidden).apply(this.activation);

        var output_errors = targets.minus(final);
        var hidden_errors = MatDot(this.who.T, output_errors);

        this.wih = this.wih.plus(MatDot(hidden_errors.multiMat(hidden).multiMat(hidden.apply((x) => (1.0 - x))), inputs.T).multiNum(this.lr));
        this.who = this.who.plus(MatDot(output_errors.multiMat(final).multiMat(final.apply((x) => (1.0 - x))), hidden.T).multiNum(this.lr));
    }
}