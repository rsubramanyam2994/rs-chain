const Transaction = require("../src/wallet/transaction")
const Wallet = require("../src/wallet/wallet")

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
            transaction = transaction.update(wallet, nextAmount, recipient)
        })

        it("subtracts nextAmount from sender's output", () => {
            expect(transaction.outputs.find(o => o.address === wallet.publicKey).amount).toEqual(430)
        })

        it("sends nextAmount to sender", () => {
            expect(transaction.outputs.find(o => o.address === recipient).amount).toEqual(20)
        })


    })

})