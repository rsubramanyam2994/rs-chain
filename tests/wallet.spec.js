const Wallet = require("../src/wallet/wallet")
const TransactionPool = require("../src/wallet/transaction-pool")


describe("Wallet", () => {
    let wallet, tp

    beforeEach(() => {
        wallet = new Wallet()
        tp = new TransactionPool()
    })

    describe("Creating a transaction", () => {
        let transaction, sendAmount, recipient

        beforeEach(() => {
            sendAmount = 50
            recipient = "some-recipient"
            transaction = wallet.createTransaction(recipient, sendAmount, tp)
        })

        describe("and doing the same transaction", () => {
            beforeEach(() => {
                wallet.createTransaction(recipient, sendAmount, tp)
            })

            it("subtracts sendAmount twice from wallet balance", () => {
                expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
                    .toEqual(wallet.balance - sendAmount*2);
            })

            it("clones sendAmount to recipient address twice", () => {
                expect(transaction.outputs.filter(o => o.address === recipient).map(t => t.amount)).toEqual([sendAmount, sendAmount])
            })
        })
    })
})