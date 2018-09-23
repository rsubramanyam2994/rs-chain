const Wallet = require("../src/wallet/wallet")
const TransactionPool = require("../src/wallet/transaction-pool")
const Blockchain = require("../src/blockchain/blockchain")
const {INITIAL_BALANCE} = require("../src/config")

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

    describe("Calculating wallet balance", () => {
        let balanceToAdd, numTimesToAdd, senderWallet

        beforeEach(() => {
            senderWallet = new Wallet()
            balanceToAdd = 100
            numTimesToAdd = 3

            for (let i = 0; i < numTimesToAdd; i++) {
                senderWallet.createTransaction(wallet.publicKey, balanceToAdd, blockchain, transactionPool)
            }
            blockchain.addBlock(transactionPool.transactions)
        })

        it("calculates the balance for the recipient", () => {
            expect(wallet.calculateBalance(blockchain)).toEqual(INITIAL_BALANCE + (balanceToAdd * numTimesToAdd))
        })

        it("calculates the balance for the sender", () => {
            expect(senderWallet.calculateBalance(blockchain)).toEqual(INITIAL_BALANCE - (balanceToAdd * numTimesToAdd))
        })

        describe("balance is calculated only using 'recent' transactions, recipient conducts transaction", () => {
            let balanceToDeduct, recipientBalance

            beforeEach(() => {
                transactionPool.clear()
                balanceToDeduct = 60
                recipientBalance = wallet.calculateBalance(blockchain)
                wallet.createTransaction(senderWallet.publicKey, balanceToDeduct, blockchain, transactionPool)
                blockchain.addBlock(transactionPool.transactions)
            })


            describe("sender sends another transaction to the recipient", () => {
                beforeEach(() => {
                    transactionPool.clear()
                    senderWallet.createTransaction(wallet.publicKey, balanceToAdd, blockchain, transactionPool)
                    blockchain.addBlock(transactionPool.transactions)
                })

                it("calculates recipient balance using only 'recent' transactions", () => {
                    expect(wallet.calculateBalance(blockchain)).toEqual(recipientBalance - balanceToDeduct + balanceToAdd)
                })

                // it("calculates sender balance using only 'recent' transactions", () => {
                //     expect(senderWallet.calculateBalance(blockchain)).toEqual(recipientBalance - balanceToDeduct)
                // })
            })

        })

    })

})