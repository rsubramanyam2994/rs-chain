const Transaction = require("./transaction")

class TransactionPool {
    constructor() {
        this.transactions = []
    }

    updateOrAddTransaction(transaction) {
        let transactionWithId = this.transactions.find(t => t.id === transaction.id)

        if (transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction
        } else {
            this.transactions.push(transaction)
        }
    }

    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address)
    }

    validTransactions() {

        return this.transactions.filter(transaction => {
            const outputTotal = transaction.outputs.reduce((acc, output) => {
                return (acc += output.amount)
            }, 0)

            if (outputTotal !== transaction.input.amount) {
                console.log(`Invalid transaction from ${transaction.input.address}`)
                return false
            }

            if (!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}`)
                return false
            }

            return true
        })
    }
}

module.exports = TransactionPool