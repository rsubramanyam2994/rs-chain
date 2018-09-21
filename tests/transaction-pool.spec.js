const TransactionPool = require("../src/wallet/transaction-pool")
const Wallet = require("../src/wallet/wallet")
const Blockchain = require("../src/blockchain/blockchain")

describe("Transaction pool", () => {
    let transactionPool, wallet, transaction, blockchain

    beforeEach(() => {
        transactionPool = new TransactionPool()
        wallet = new Wallet()
        blockchain = new Blockchain()
        transaction = wallet.createTransaction("some-recipient", 30, blockchain, transactionPool)
    })

    it("adds new transaction to the pool", () => {
        expect(transactionPool.transactions.find(t => t.id === transaction.id)).toEqual(transaction)
    })

    it("updates a transaction in the pool", () => {
        const oldTransaction = JSON.stringify(transaction)
        transaction.update(wallet, "some-other-recipient", 40)
        transactionPool.updateOrAddTransaction(transaction)
        expect(JSON.stringify(transactionPool.transactions.find(t => t.id === transaction.id))).not.toEqual(oldTransaction)
    })

    it("clears transactions", () => {
        transactionPool.clear()
        expect(transactionPool.transactions).toEqual([])
    })

    describe("mixing valid and corrupt transactions", () => {
        let validTransactions

        beforeEach(() => {
            validTransactions = [...transactionPool.transactions]

            for (let i = 0; i < 6; i++) {
                wallet = new Wallet()
                transaction = wallet.createTransaction("some-other-recipient", 30, blockchain, transactionPool)
                if (i % 2 === 0) {
                    transactionPool.transactions.forEach(t => {
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
            expect(JSON.stringify(transactionPool.transactions)).not.toEqual(JSON.stringify(validTransactions))
        })

        it("grabs valid transactions", () => {
            expect(transactionPool.validTransactions().length).toEqual(validTransactions.length)
        })
    })
})
