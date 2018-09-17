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

app.post("/mine", (req, res) => {
    const block = blockchain.addBlock(req.body.data)
    console.log(`New block added ${block.toString()}`)
    p2pServer.syncChains()
    res.redirect("/blocks")
})

app.post("/transact", (req, res) => {
    const { recipient, amount } = req.body
    const transaction = wallet.createTransaction(recipient, amount, transactionPool)
    p2pServer.broadcastTransaction(transaction)
    res.redirect("/transactions")
})

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port: ${HTTP_PORT}`)
})

p2pServer.listen()