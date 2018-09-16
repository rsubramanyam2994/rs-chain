const ChainUtil = require("../utils/chain-utils")

class Transaction {
    constructor() {
        this.id = ChainUtil.id()
        this.input = null
        this.outputs = []
    }

    update(senderWallet, recipient, amount) {
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey)

        if (amount > senderOutput.amount) { // if amount exceeds balance
            console.log(`Amount: ${amount} exceeds balance`)
        }

        senderOutput.amount = senderOutput.amount - amount
        this.outputs.push({ amount, address: recipient })

        Transaction.signTransaction(this, senderWallet)

        return this
    }

    static newTransaction(senderWallet, recipient, amount) { // this is a factory function right?
        const transaction = new this();

        if (amount > senderWallet.balance) {
            console.log(`Amount ${amount} exceeds balance`)
            return
        }

        transaction.outputs.push(...[
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount, address: recipient }
        ]);

        Transaction.signTransaction(transaction, senderWallet)

        return transaction;
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs)) // hashing to pass in fixed length input
            // Given ChainUtil.hash(transaction.outputs) which is the dataHash, can we find out what data it is?
            // Checked, Seems like we can.
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(transaction.input.address, transaction.input.signature, ChainUtil.hash(transaction.outputs))
    }
}

module.exports = Transaction