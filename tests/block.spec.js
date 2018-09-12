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
})