const WebSocket = require("ws")

const {env} = process

const P2P_PORT = env.P2P_PORT || 5001
const peers = env.PEERS ? env.PEERS.split(",") : []

class P2pServer {
    constructor(blockchain) {
        this.blockchain = blockchain
        this.sockets = []
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
            // console.log(msg)
            this.blockchain.replaceChain(data)
        })
    }

    sendChain(socket) {
        socket.send(JSON.stringify(this.blockchain.chain))
    }

    syncChains() {
        this.sockets.forEach(socket => {
            this.sendChain(socket) // socket includes self port also, how can you send a message to yourself?
        })
    }

}

module.exports = P2pServer