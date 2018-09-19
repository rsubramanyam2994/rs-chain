const WebSocket = require("ws")

const {env} = process

const P2P_PORT = env.P2P_PORT || 5001
const peers = env.PEERS ? env.PEERS.split(",") : []
const MESSAGE_TYPES = {
    chain: "CHAIN",
    transaction: "TRANSACTION",
    clear_transactions: "CLEAR_TRANSACTIONS"
}

class P2pServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain
        this.sockets = []
        this.transactionPool = transactionPool
    }

    listen() {
        const server = new WebSocket.Server({port: P2P_PORT})
        server.on("connection", socket => this.connectSocket(socket))
        // can listen to specific types of messages sent by web-socket-server
        // can fire specifc code whenever new socket is added
        this.connectToPeers()
    }

    connectToPeers() {
        peers.forEach((peer) => {
            const socket = new WebSocket(peer)
            console.log(`Connecting to peer at ${peer}`)
            socket.on("open", () => this.connectSocket(socket))
        })
    }

    connectSocket(socket) {
        this.sockets.push(socket)
        console.log("Socket connected")
        this.messageHandler(socket)
        this.sendChain(socket)
    }

    messageHandler(socket) {
        socket.on("message", (msg) => {

            const data = JSON.parse(msg)

            switch (data.type) {
                case MESSAGE_TYPES.chain: {
                    this.blockchain.replaceChain(data.chain)
                    break
                }

                case MESSAGE_TYPES.transaction: {
                    this.transactionPool.updateOrAddTransaction(data.transaction)
                    break
                }

                case MESSAGE_TYPES.clear_transactions: {
                    this.transactionPool.updateOrAddTransaction(data.transaction)
                    break
                }
            }
        })
    }

    sendChain(socket) {
        socket.send(JSON.stringify({ type: MESSAGE_TYPES.chain, chain: this.blockchain.chain }))
    }

    syncChains() {
        this.sockets.forEach(socket => {
            this.sendChain(socket) // socket includes self port also, how can you send a message to yourself?
        })
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({ type: MESSAGE_TYPES.transaction, transaction }))
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction)
        })
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => {
            socket.send(JSON.stringify({ type: MESSAGE_TYPES.clear_transactions }))
        })
    }


}

module.exports = P2pServer