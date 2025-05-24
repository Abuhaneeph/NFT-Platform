# NFT Creator Platform

A decentralized NFT creation and minting platform built on Lisk Sepolia testnet. Create, mint, and showcase your digital art while earning Creator Tokens for every NFT you create.

## 🌟 Features

- **NFT Minting**: Upload and mint your digital artwork as NFTs
- **Creator Rewards**: Earn Creator Tokens (CRT) automatically for every NFT minted
- **IPFS Storage**: Decentralized storage using Pinata for images and metadata
- **Gallery View**: Browse all minted NFTs or filter to view only your creations
- **Wallet Integration**: Connect with MetaMask to interact with the platform
- **Real-time Updates**: Newly minted NFTs appear immediately in the gallery

## 🚀 Live Demo

[Add your deployed application URL here]

## 🛠 Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Blockchain**: Lisk Sepolia Testnet
- **Smart Contracts**: Solidity (NFT Contract + ERC20 Token Contract)
- **Storage**: IPFS via Pinata
- **Web3**: Web3.js for blockchain interactions
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MetaMask browser extension
- Lisk Sepolia testnet ETH for gas fees

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone [your-repository-url]
   cd nft-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install required packages**
   ```bash
   npm install web3 react lucide-react
   ```

4. **Configure environment variables**
   - Update the Pinata JWT token in the code
   - Verify contract addresses are correct

5. **Start the development server**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Contract Addresses
- **NFT Contract**: `0x6a257B0a406eB762C105130314dB15B1a29AbC4e`
- **Lisk Sepolia Chain ID**: `0x106a` (4202 in decimal)

### Pinata Setup
1. Create a Pinata account at [pinata.cloud](https://pinata.cloud)
2. Generate a JWT token from your Pinata dashboard
3. Replace the `PINATA_JWT` constant in the code with your token

### MetaMask Setup
1. Install MetaMask browser extension
2. Add Lisk Sepolia network:
   - **Network Name**: Lisk Sepolia
   - **RPC URL**: `https://rpc.sepolia-api.lisk.com`
   - **Chain ID**: `4202`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: `https://sepolia-blockscout.lisk.com`

## 🎯 How to Use

### Connecting Your Wallet
1. Click "Connect Wallet" button
2. Approve the connection in MetaMask
3. The app will automatically switch to Lisk Sepolia network

### Minting an NFT
1. **Upload File**: Select an image or video file
2. **Enter Details**: Provide NFT name and description
3. **Set Recipient**: Choose the wallet address to receive the NFT
4. **Mint**: Click "Mint NFT" and confirm the transaction
5. **Earn Rewards**: Receive Creator Tokens automatically

### Viewing NFTs
- **All NFTs**: Browse all minted NFTs on the platform
- **My NFTs**: Filter to see only NFTs you've created
- **Metadata**: Click links to view full metadata on IPFS

## 🏗 Smart Contract Functions

The platform interacts with the following smart contract methods:

### NFT Contract
- `mintNFT(address to, string tokenURI)` - Mint new NFT
- `getAllNFTs()` - Get all minted NFTs
- `getNFTsByCreator(address creator)` - Get NFTs by specific creator
- `totalSupply()` - Get total number of minted NFTs

### Token Contract
- `balanceOf(address account)` - Get Creator Token balance
- `REWARD_AMOUNT()` - Get reward amount per NFT

## 🔍 Features in Detail

### Creator Token Rewards
- Automatically earn tokens when minting NFTs
- Track your token balance in the dashboard
- Rewards are distributed immediately upon successful minting

### IPFS Storage
- Images uploaded to IPFS via Pinata
- Metadata stored as JSON on IPFS
- Decentralized and permanent storage

### Gallery Features
- Real-time NFT display
- Filter between all NFTs and personal collection
- Copy metadata URIs
- View full metadata on IPFS

## 🐛 Troubleshooting

### Common Issues

**"Web3 is not defined" Error**
- Ensure Web3 is imported: `import Web3 from 'web3';`

**Images not displaying**
- Check if metadata is properly fetched from IPFS
- Verify Pinata gateway is accessible

**Transaction Failed**
- Ensure sufficient ETH for gas fees
- Check if you're connected to Lisk Sepolia network

**MetaMask Connection Issues**
- Refresh the page and try reconnecting
- Clear browser cache and cookies

## 🚧 Development

### Project Structure
```
src/
├── components/
├── ABI/
│   ├── NFT_CONTRACT_ABI.js
│   └── TOKEN_CONTRACT_ABI.js
├── App.jsx
└── index.js
```

### Adding New Features
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the smart contract documentation

## 🎨 Screenshots

[Add screenshots of your application here]

---

**Built with ❤️ on Lisk Sepolia**