const BlockChain = require("../src/blockchain")

bc = new BlockChain()

for (let i = 1; i <= 10; i++) {
    console.log(bc.addBlock(`foo : ${i}`).toString())
}