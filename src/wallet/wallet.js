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

    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain)
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

    calculateBalance(blockchain) {
        let balance = this.balance
        let transactions = []

        blockchain.chain.forEach(block => {
            if (!(block.data === "genesis-data")) { // TODO: what's the correct thing todo here?
                block.data.forEach(transaction => {
                    transactions.push(transaction)
                })
            }
        })

        const walletInputTransactions = transactions.filter(t => t.input.address === this.publicKey)

        let startTime = 0

        // input of most recent transaction
        if (walletInputTransactions.length) {
            const mostRecentInputTransaction = walletInputTransactions.reduce((prev, current) => {
                return(prev.input.timestamp > current.input.timestamp ? prev : current)
            })

            balance = mostRecentInputTransaction.outputs.find(output => output.address === this.publicKey).amount
            startTime = mostRecentInputTransaction.input.timestamp
        }

        // plus sum of outputs to the wallet from transactions after that
        transactions.forEach(transaction => {
            if (transaction.input.timestamp > startTime) {
                transaction.outputs.find(output => {
                    if (output.address === this.publicKey) {
                        balance += output.amount
                    }
                })
            }
        })
        return balance
    }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = "blockchain-wallet"
        return blockchainWallet
    }
}

module.exports = Wallet;