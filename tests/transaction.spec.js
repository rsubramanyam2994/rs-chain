const Transaction = require("../src/wallet/transaction")
const Wallet = require("../src/wallet/wallet")
const { MINING_REWARD } = require("../src/config")

describe("Transaction", () => {
    let transaction, wallet, recipient, amount

    beforeEach(() => {
        wallet = new Wallet()
        amount = 50
        recipient = "r3c1p1ent"
        transaction = Transaction.newTransaction(wallet, recipient, amount)
    })

    it("outputs the amount subtracted from the original balance", () => {
        expect(transaction.outputs.find(o => o.address === wallet.publicKey).amount).toEqual(wallet.balance - amount)
    })

    it("sends given amount to receiver", () => {
        expect(transaction.outputs.find(o => o.address === recipient).amount).toEqual(amount)
    })

    it("inputs the balance of wallet", () => {
        expect(transaction.input.amount).toEqual(wallet.balance)
    })

    it("validates a valid transaction", () => {
        expect(Transaction.verifyTransaction(transaction)).toEqual(true)
    })

    it("invalidates a corrupt transaction", () => {
        transaction.outputs[0].amount = "questionable-amount"
        expect(Transaction.verifyTransaction(transaction)).toEqual(false)
    })

    describe("transacting with an amount that exceeds the balance", () => {
        beforeEach(() => {
            amount = 50000;
            transaction = Transaction.newTransaction(wallet, recipient, amount);
        });

        it("does not create the transaction", () => {
            expect(transaction).toEqual(undefined);
        });
    });

    describe("updating a transaction", () => {
        let nextAmount, recipient

        beforeEach(() => {
            nextAmount = 20
            recipient = "n3xt"
            transaction = transaction.update(wallet, recipient, nextAmount)
        })

        it("subtracts nextAmount from sender's output", () => {
            expect(transaction.outputs.find(o => o.address === wallet.publicKey).amount).toEqual(430)
        })

        it("sends nextAmount to sender", () => {
            expect(transaction.outputs.find(o => o.address === recipient).amount).toEqual(20)
        })
    })

    describe("create a reward transaction", () => {
        beforeEach(() => {
            transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet())
        })

        it("reward the miner", () => {
            expect(transaction.outputs.find(t => t.address === wallet.publicKey).amount).toEqual(MINING_REWARD)
        })

    })

})