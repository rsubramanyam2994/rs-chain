const Block = require("../src/block")

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
        expect(block.hash.substring(0, block.difficulty)).toEqual("0".repeat(block.difficulty))
    })

    it("lowers difficulty for slowly mined blocks", () => {
        expect(Block.adjustDifficulty(block, block.timestamp + 360000)).toEqual(block.difficulty - 1)
    })

    it("lowers difficulty for quickly mined blocks", () => {
        expect(Block.adjustDifficulty(block, block.timestamp - 360000)).toEqual(block.difficulty + 1)
    })
})