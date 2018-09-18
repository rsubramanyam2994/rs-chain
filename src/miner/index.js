class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain
        this.transactionPool = transactionPool
        this.wallet = wallet
        this.p2pServer = p2pServer
    }


    // clear confirmed transactions from pool
    // blockchain itself adds reward transaction, not any user's wallet, with the sender being the blockchain itself



    mine() {
        const validTransactions = this.transactionPool.validTransactions() // select only valid transactions from pool
        // include a reward for the miner
        // create a block with valid transactions
        // synchronize chains in p2pserver
        // broadcast to every miner to clear their transaction pools
    }
}

module.exports = Miner