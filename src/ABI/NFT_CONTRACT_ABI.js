const NFT_CONTRACT_ABI = [
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "tokenURI_", "type": "string"}],
    "name": "mintNFT",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllNFTs",
    "outputs": [
      {"name": "tokenIds", "type": "uint256[]"},
      {"name": "creators", "type": "address[]"},
      {"name": "owners", "type": "address[]"},
      {"name": "tokenURIs", "type": "string[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "creator", "type": "address"}],
    "name": "getNFTsByCreator",
    "outputs": [
      {"name": "tokenIds", "type": "uint256[]"},
      {"name": "tokenURIs", "type": "string[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "creatorOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "creatorToken",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": true, "name": "creator", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "tokenURI", "type": "string"},
      {"indexed": false, "name": "rewardAmount", "type": "uint256"}
    ],
    "name": "NFTMinted",
    "type": "event"
  }
];

export default NFT_CONTRACT_ABI;