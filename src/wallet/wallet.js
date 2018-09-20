const { INITIAL_BALANCE } = require("../config");
const ChainUtil = require("../utils/chain-utils");
const Transaction = require("./transaction")

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE; // which part of code continuously decreases this?
        // seems like we main balance only using transaction objects
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode("hex");
    }

    toString() {
        return `Wallet -
    publicKey : ${this.publicKey.toString()}
    balance   : ${this.balance}`
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash)
    }

    createTransaction(recipient, amount, transactionPool) {
        if (amount > this.balance) {
            console.log(`Amount: ${amount} exceeds wallet balance: ${this.balance}`)
            return
        }

        let transaction = transactionPool.existingTransaction(this.publicKey)

        if (transaction) {
            transaction.update(this, recipient, amount) // basically transaction with same input address are grouped into one
            // does above do an in-place update by reference to the transactionPool array?
        } else {
            transaction = Transaction.newTransaction(this, recipient, amount)
            transactionPool.updateOrAddTransaction(transaction)
        }

        return transaction
    }

    // calculateBalance(blockchain) {
    //     let balance = this.balance
    //     let transactions = []
    //
    //     blockchain.chain.forEach(
    //         block.data.forEach(transaction => {
    //             transactions.push(transaction)
    //         })
    //     )
    //
    //     const walletInputTransactions = transactions.filter(t => t.input.address == this.publicKey)
    //
    //
    // }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = "blockchain-wallet"
        return blockchainWallet
    }
}

module.exports = Wallet;