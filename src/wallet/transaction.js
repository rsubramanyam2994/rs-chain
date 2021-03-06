const ChainUtil = require("../utils/chain-utils")
const { MINING_REWARD } = require("../config")

class Transaction {
    constructor() {
        this.id = ChainUtil.id()
        this.input = null
        this.outputs = []
    }

    update(senderWallet, recipient, amount) {

        // checking balance in previous entry output of transaction
        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey)

        if (amount > senderOutput.amount) { // if amount exceeds balance
            console.log(`Amount: ${amount} exceeds balance within a transaction`)
            return
        }

        senderOutput.amount = senderOutput.amount - amount
        this.outputs.push({ amount, address: recipient })

        Transaction.signTransaction(this, senderWallet)

        return this
    }

    static transactionWithOutputs (senderWallet, outputs) {
        const transaction = new this();
        transaction.outputs.push(...outputs)
        Transaction.signTransaction(transaction, senderWallet)
        return transaction
    }

    static newTransaction(senderWallet, recipient, amount) { // this is a factory function right?
        if (amount > senderWallet.balance) {
            console.log(`Amount ${amount} exceeds balance`)
            return
        }

        return Transaction.transactionWithOutputs(senderWallet,
            [{ amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount, address: recipient }])

    }

    static rewardTransaction(minerWallet, blockchainWallet) {
        return Transaction.transactionWithOutputs(blockchainWallet,
            [{ amount: MINING_REWARD, address:  minerWallet.publicKey}])
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs)) // hashing to pass in fixed length input
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(transaction.input.address, transaction.input.signature, ChainUtil.hash(transaction.outputs))
    }
}

module.exports = Transaction