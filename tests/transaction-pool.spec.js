const TransactionPool = require("../src/wallet/transaction-pool")
const Transaction = require("../src/wallet/transaction")
const Wallet = require("../src/wallet/wallet")

describe("Transaction pool", () => {
    let tp, wallet, transaction

    beforeEach(() => {
        tp = new TransactionPool()
        wallet = new Wallet()
        transaction = Transaction.newTransaction(wallet, "some-recipient", 30)
        tp.updateOrAddTransaction(transaction)
    })

    it("adds new transaction to the pool", () => {
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction)
    })

    it("updates a transaction in the pool", () => {
        const oldTransaction = JSON.stringify(transaction)
        transaction.update(wallet, "some-other-recipient", 40)
        tp.updateOrAddTransaction(transaction)
        expect(JSON.stringify(tp.transactions.find(t => t.id === transaction.id))).not.toEqual(oldTransaction)
    })

})
