const Block = require("../src/block")
const { DIFFICULTY } = require("../src/config")

describe("Block", () => {

    let data
    let lastBlock
    let block

    beforeEach(() => {
        data = "bar"
        lastBlock = Block.genesis()
        block = Block.mineBlock(lastBlock, data)
    })

    it("sets the data to match input", () => {
        expect(block.data).toEqual(data)
    })

    it("sets lastHash to match hash of previous block", () => {
        expect(block.lastHash).toEqual(lastBlock.hash)
    })

    it("generates hash that matches difficulty", () => {
        expect(block.hash.substring(0, DIFFICULTY)).toEqual("0".repeat(DIFFICULTY))
    })
})