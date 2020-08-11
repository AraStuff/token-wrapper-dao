const RLP = require('rlp')
const {keccak256} = require('web3-utils');
const { ethers } = require('ethers')



async function buildNonceForAddress(_address, _index) {
    const txCount = await provider.getTransactionCount(_address);
    return `0x${(txCount + _index).toString(16)}`;
}

function calculateNewProxyAddress(_daoAddress, _nonce) {
    const rlpEncoded = RLP.encode([_daoAddress, _nonce]);
    const contractAddressLong = keccak256(rlpEncoded);
    const contractAddress = `0x${contractAddressLong.substr(-40)}`;

    return contractAddress;
}

export default async function counterfactualAddress(_address, _index, network) {
    const provider = ethers.getDefaultProvider(network);
    const nonce = await buildNonceForAddress(_address, _index, provider)
    return calculateNewProxyAddress(_address, nonce)
}
