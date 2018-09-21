const express = require("express")
const bodyParser = require("body-parser")
const Blockchain = require("./blockchain/blockchain")
const P2pServer = require("./p2p/p2p-server")
const Wallet = require("./wallet/wallet")
const TransactionPool = require("./wallet/transaction-pool")
const Miner = require("./miner/miner")

const HTTP_PORT = process.env.HTTP_PORT || 3001

const app = express()

app.use(bodyParser.json())

const transactionPool = new TransactionPool()
const blockchain = new Blockchain()
const p2pServer = new P2pServer(blockchain, transactionPool)
const wallet = new Wallet()
const miner = new Miner(blockchain, transactionPool, wallet, p2pServer)


app.get("/blocks", (req, res) => {
    res.json(blockchain.chain)
})

app.get("/transactions", (req, res) => {
    res.json(transactionPool.transactions)
})

app.get("/public-key", (req, res) => {
    res.json({ publicKey: wallet.publicKey })
})

app.post("/mine", (req, res) => {
    const block = blockchain.addBlock(req.body.data)
    console.log(`New block added ${block.toString()}`)
    p2pServer.syncChains()
    res.redirect("/blocks")
})

app.get("/mine-transactions", (req, res) => {
    const block = miner.mine()
    console.log(`New block added: ${block}`)
    res.redirect("/blocks")
})

app.post("/transact", (req, res) => {
    const { recipient, amount } = req.body
    const transaction = wallet.createTransaction(recipient, amount, blockchain, transactionPool) // Here basically, every instance of the application is one wallet
    if (transaction) {
        p2pServer.broadcastTransaction(transaction)
    }
    res.redirect("/transactions")
})

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port: ${HTTP_PORT}`)
})

p2pServer.listen()

// Existing flow
// Blockchain
// Call /mine and give it some data
// It'll mine a new block, create hash based on last block and add it to the block chain
// Blockchain is sent to all peers

// Transaction
// Call /transact and give it amount and recipient
// Every instance of the application is a wallet
// It'll append to existing transaction or create a new transaction based on whether any transaction already exists with
//     input.address = wallet.publicKey
// This transaction is added to the transaction pool of the running instance and is broadcasted to all peers
// Within a transaction, output balance for the input address is continuosly reduced

// Mining
// Call /mine-transactions
// Reward plus all valid transactions in the transaction pool are mined into a block
// Blockchain is updated and sent to peers, clear transactions message is sent to all peers by the one who
//   mined the block



// TODO:
// 1. Mine block using set of transactions and then delete transactions
// 2. Update wallet balance after mining a block?
// 3. Where is the part where the amount given to the recipient is added to his wallet? (where does accumulation happen?)
// 4. How to implement the case where every instance is not a wallet? Is the correct solution, the user should give his public key,
//    recipient and amount?
// 5. Is one transaction always per wallet? (seems like it has to be as the input is not an array)
// 6. Transactions can say anything, how does each and every transaction reflect in every person's bitcoin wallet?
// 7. After receiving a blockchain, we check for validity yes, do we also check for validity of individual transactions in the new blocks of something?
//    Where does merkle trees come in here?

