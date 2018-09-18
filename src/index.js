const express = require("express")
const bodyParser = require("body-parser")
const Blockchain = require("./blockchain/blockchain")
const P2pServer = require("./p2p/p2p-server")
const Wallet = require("./wallet/wallet")
const TransactionPool = require("./wallet/transaction-pool")


const HTTP_PORT = process.env.HTTP_PORT || 3001

const app = express()

app.use(bodyParser.json())


const transactionPool = new TransactionPool()
const blockchain = new Blockchain()

const p2pServer = new P2pServer(blockchain, transactionPool)
const wallet = new Wallet()

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

app.post("/transact", (req, res) => {
    const { recipient, amount } = req.body
    const transaction = wallet.createTransaction(recipient, amount, transactionPool) // Here basically, every instance of the application is one wallet
    p2pServer.broadcastTransaction(transaction)
    res.redirect("/transactions")
})

// where is the part where the amount given to the recipient is added to his wallet? (where does accumulation happen?)
// how to implement the case where every instance is not a wallet? Is the correct solution, the user should give his public key,
// recipient and amount?
// Transactions can say anything, how does each and every transaction reflect in every person's bitcoin wallet?
// Is one transaction always per wallet? (seems like it has to be as the input is not an array)




app.listen(HTTP_PORT, () => {
    console.log(`Listening on port: ${HTTP_PORT}`)
})

p2pServer.listen()