const Blockchain = require("../src/blockchain")
const Block = require("../src/block")

describe("Blockchain", () => {
    let blockchain
    let blockchain2

    beforeEach(() => {
        blockchain = new Blockchain()
        blockchain2 = new Blockchain()
    })

    it("should start with genesis block", () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    })

    it("adds a new block", () => {
        const data = "foo"
        blockchain.addBlock(data)
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(data)
    })

    it("validates a valid chain", () => {
        blockchain2.addBlock("foo")
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(true)
    })

    it("invalidates a chain with corrupt genesis block", () => {
        blockchain2.chain[0].data = "bad data"
        blockchain2.addBlock("foo")
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
    })

    it("invalidates a corrupt chain", () => {
        blockchain2.addBlock("foo")
        blockchain2.chain[1].data = "not foo"
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
    })

})