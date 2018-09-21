const Wallet = require("../src/wallet/wallet")
const TransactionPool = require("../src/wallet/transaction-pool")
const Blockchain = require("../src/blockchain/blockchain")


describe("Wallet", () => {
    let wallet, transactionPool, blockchain

    beforeEach(() => {
        wallet = new Wallet()
        transactionPool = new TransactionPool()
        blockchain = new Blockchain()
    })

    describe("Creating a transaction", () => {
        let transaction, sendAmount, recipient

        beforeEach(() => {
            sendAmount = 50
            recipient = "some-recipient"
            transaction = wallet.createTransaction(recipient, sendAmount, blockchain, transactionPool)
        })

        describe("and doing the same transaction", () => {
            beforeEach(() => {
                wallet.createTransaction(recipient, sendAmount, blockchain, transactionPool)
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