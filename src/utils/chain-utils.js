const EC = require("elliptic").ec
const uuidV1 = require("uuid/v1")
const ec = new EC("secp256k1") // standard of efficient cryptography, prime, 256 bits (32 bytes) elliptic base algo requires prime number
// to generate curve. in this case prime number will be 32 bytes log, k - koblets (mathematician), 1, implementation number
const SHA256 = require("crypto-js/sha256")

class ChainUtil {
    static genKeyPair() {
        return ec.genKeyPair();
    }

    static id() {
        return uuidV1()
    }

    static hash(data) {
        return SHA256(`${JSON.stringify(data)}`).toString()
    }

    static verifySignature (publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, "hex").verify(dataHash, signature) // Why the hex conversion?
    }

}

module.exports = ChainUtil