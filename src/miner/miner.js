const Transaction = require("../wallet/transaction")
const Wallet = require("../wallet/wallet")

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain
        this.transactionPool = transactionPool
        this.wallet = wallet
        this.p2pServer = p2pServer
    }


    // clear confirmed transactions from pool
    // blockchain itself adds reward transaction, not any user's wallet, with the sender being the blockchain itself

    // filter for valid transactions
    // include a reward for the miner
    // create a block with valid transactions
    // synchronize chains in p2pserver
    // broadcast to every miner to clear their transaction pools

    mine() {
        const validTransactions = this.transactionPool.validTransactions()
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())) // one instance, one wallet, balance decreased from same wallet, miner also has same wallet?s
        const block = this.blockchain.addBlock(validTransactions)
        this.p2pServer.syncChains()
        this.transactionPool.clear()
        this.transactionPool.broadcastClearTransactions()

        return block
    }
    // TODO:
    // 1. What's the trigger to start mining?
    // 2. Is it true that all instances look at same transactions and as soon as one of them creates a block, it sends out a clear
    //    message and everybody else clears their transactions? Don't other instances have to check validity of the new blockchain
    //    and a few more things?
}

module.exports = Miner