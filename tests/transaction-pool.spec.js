const TransactionPool = require("../src/wallet/transaction-pool")
const Wallet = require("../src/wallet/wallet")

describe("Transaction pool", () => {
    let tp, wallet, transaction

    beforeEach(() => {
        tp = new TransactionPool()
        wallet = new Wallet()
        transaction = wallet.createTransaction("some-recipient", 30, tp)
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

    it("clears transactions", () => {
        tp.clear()
        expect(tp.transactions).toEqual([])
    })

    describe("mixing valid and corrupt transactions", () => {
        let validTransactions

        beforeEach(() => {
            validTransactions = [...tp.transactions]

            for (let i = 0; i < 6; i++) {
                wallet = new Wallet()
                transaction = wallet.createTransaction("some-other-recipient", 30, tp)
                if (i % 2 === 0) {
                    tp.transactions.forEach(t => {
                        if (t.id === transaction.id) {
                            t.input.amount = 99999
                        }
                    })
                } else {
                    validTransactions.push(transaction)
                }
            }
        })

        it("filters out invalid transactions", () => {
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions))
        })

        it("grabs valid transactions", () => {
            expect(tp.validTransactions().length).toEqual(validTransactions.length)
        })
    })
})
