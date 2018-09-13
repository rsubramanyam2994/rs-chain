const Block = require("./block")

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()]
    }

    addBlock(data) {
        const block = Block.mineBlock(this.chain[this.chain.length - 1], data)
        this.chain.push(block)
        return block
    }

    // Question: How does everyone get access to the genesis in the first place?
    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false
        }

        for (let i = 1; i < chain.length; i++) {
            const currentBlock = chain[i]
            const lastBlock = chain[i-1]

            if (currentBlock.lastHash !== lastBlock.hash) {
                return false
            }

            if (currentBlock.hash !== Block.blockHash(currentBlock)) {
                return false
            }
        }
        return true
    }

    replaceChain(newChain) {
        if (this.chain.length >= newChain.length) {
            console.log("Received chain shorter than existing chain")
        } else if (!this.isValidChain(newChain)) {
            console.log("Invalid chain")
        } else {
            console.log("Replacing existing chain with new chain")
            this.chain = newChain
        }
    }
}

module.exports = Blockchain