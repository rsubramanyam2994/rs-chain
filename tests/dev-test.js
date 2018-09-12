const Block = require("../src/block")

const fooBlock = Block.mineBlock(Block.genesis(), "foo")

console.log(fooBlock.toString())
