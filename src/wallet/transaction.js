const ChainUtil = require("../utils/chain-utils")
const { MINING_REWARD } = require("../config")

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
            [{ amount: MINING_REWARD, address:  minerWallet.publicKey}]) // so this transaction will
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance, // doesn't this have to be continuosly reduced?
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