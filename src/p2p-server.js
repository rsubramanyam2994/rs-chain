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
        this.connectToPeers()
        console.log(`Listening for peer to peer connection on ${P2P_PORT}`)
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
        socket.send(JSON.stringify(this.blockchain.chain))
    }

    messageHandler(socket) {
        socket.on("message", (msg) => {
            const data = JSON.parse(msg)
            console.log(msg)
        })
    }

}

module.exports = P2pServer