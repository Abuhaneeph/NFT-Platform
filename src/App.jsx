import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, Upload, Award, Image, Copy, ExternalLink, Loader2, User, Filter } from 'lucide-react';
import NFT_CONTRACT_ABI from './ABI/NFT_CONTRACT_ABI';
import  TOKEN_CONTRACT_ABI from './ABI/TOKEN_CONTRACT_ABI';
import Web3 from 'web3';

// Contract addresses 
const NFT_CONTRACT_ADDRESS = "0x6a257B0a406eB762C105130314dB15B1a29AbC4e";
const LISK_SEPOLIA_CHAIN_ID = "0x106a"; // 4202 in hex

// Pinata configuration (you'll need to add your Pinata JWT token)
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

function NFTPlatform() {
  const [nftMetadata, setNftMetadata] = useState({});
  const [account, setAccount] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [rewardAmount, setRewardAmount] = useState('100');
  const [nfts, setNfts] = useState([]);
  const [myNfts, setMyNfts] = useState([]);
  const [rewardEvents, setRewardEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState('0');
  
  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  
  // Filter states
  const [showMyNFTs, setShowMyNFTs] = useState(false);

  const fetchNFTMetadata = async (tokenURI) => {
  try {
    const response = await fetch(tokenURI);
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};

  const connectWallet = async () => {
            if (typeof window.ethereum !== 'undefined') {
              try {
                setLoading(true);
                
                const accounts = await window.ethereum.request({
                  method: 'eth_requestAccounts'
                });
                
                try {
                  await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: LISK_SEPOLIA_CHAIN_ID }]
                  });
                } catch (switchError) {
                  if (switchError.code === 4902) {
                    await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [{
                        chainId: LISK_SEPOLIA_CHAIN_ID,
                        chainName: 'Lisk Sepolia',
                        nativeCurrency: {
                          name: 'ETH',
                          symbol: 'ETH',
                          decimals: 18
                        },
                        rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
                        blockExplorerUrls: ['https://sepolia-blockscout.lisk.com']
                      }]
                    });
                  }
                }
                
                // Initialize real Web3
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                
                const nftContractInstance = new web3Instance.eth.Contract(NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS);
                setNftContract(nftContractInstance);
                
                // Get token contract address
                const tokenAddress = await nftContractInstance.methods.creatorToken().call();
                const tokenContractInstance = new web3Instance.eth.Contract(TOKEN_CONTRACT_ABI, tokenAddress);
                setTokenContract(tokenContractInstance);
                
                setAccount(accounts[0]);
                setRecipient(accounts[0]);
                
              } catch (error) {
                console.error('Error connecting wallet:', error);
                alert('Failed to connect wallet');
              } finally {
                setLoading(false);
              }
            } else {
              alert('Please install MetaMask!');
            }
          };

          const uploadToPinata = async (file, metadata) => {
            try {
              setUploadLoading(true);
              
              const formData = new FormData();
              formData.append('file', file);
              
              const pinataMetadata = JSON.stringify({
                name: `${nftName}_image`,
              });
              formData.append('pinataMetadata', pinataMetadata);
              
              const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${PINATA_JWT}`,
                },
                body: formData,
              });
              
              if (!imageResponse.ok) {
                throw new Error('Failed to upload image to Pinata');
              }
              
              const imageResult = await imageResponse.json();
              const imageUrl = `${PINATA_GATEWAY}${imageResult.IpfsHash}`;
              
              const fullMetadata = {
                ...metadata,
                image: imageUrl,
                external_url: imageUrl,
              };
              
              const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${PINATA_JWT}`,
                },
                body: JSON.stringify({
                  pinataContent: fullMetadata,
                  pinataMetadata: {
                    name: `${nftName}_metadata`,
                  },
                }),
              });
              
              if (!metadataResponse.ok) {
                throw new Error('Failed to upload metadata to Pinata');
              }
              
              const metadataResult = await metadataResponse.json();
              return `${PINATA_GATEWAY}${metadataResult.IpfsHash}`;
              
            } catch (error) {
              console.error('Pinata upload error:', error);
              throw error;
            } finally {
              setUploadLoading(false);
            }
          };

      const loadUserData = useCallback(async () => {
  if (!account || !tokenContract || !nftContract) return;
  
  try {
    const balance = await tokenContract.methods.balanceOf(account).call();
    setTokenBalance((Number(balance) / 1e18).toFixed(2));
    
    const reward = await tokenContract.methods.REWARD_AMOUNT().call();
    setRewardAmount((Number(reward) / 1e18).toFixed(0));
    
    const supply = await nftContract.methods.totalSupply().call();
    setTotalSupply(supply);
    
    const nftData = await nftContract.methods.getAllNFTs().call();
    const nftList = nftData.tokenIds.map((id, index) => ({
      tokenId: id,
      creator: nftData.creators[index],
      owner: nftData.owners[index],
      tokenURI: nftData.tokenURIs[index]
    }));
    setNfts(nftList);
    
    const userNftData = await nftContract.methods.getNFTsByCreator(account).call();
    const userNftList = userNftData.tokenIds.map((id, index) => ({
      tokenId: id,
      tokenURI: userNftData.tokenURIs[index],
      creator: account
    }));
    setMyNfts(userNftList);
    
    // Fetch metadata for all NFTs
    const metadataPromises = nftList.map(async (nft) => {
      const metadata = await fetchNFTMetadata(nft.tokenURI);
      return { tokenId: nft.tokenId, metadata };
    });
    
    const metadataResults = await Promise.all(metadataPromises);
    const metadataMap = {};
    metadataResults.forEach(({ tokenId, metadata }) => {
      if (metadata) {
        metadataMap[tokenId] = metadata;
      }
    });
    setNftMetadata(metadataMap);
    
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}, [account, tokenContract, nftContract]);

          const handleFileSelect = (e) => {
            const file = e.target.files[0];
            setSelectedFile(file);
            
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => setFilePreview(e.target.result);
              reader.readAsDataURL(file);
            } else {
              setFilePreview(null);
            }
          };

         const mintNFT = async () => {
  if (!selectedFile || !nftName || !recipient || !nftContract || !account) {
    alert('Please fill all fields and select a file');
    return;
  }
  
  try {
    setMintLoading(true);
    
    const metadata = {
      name: nftName,
      description: nftDescription || '',
      attributes: [
        {
          trait_type: "Creator",
          value: formatAddress(account)
        },
        {
          trait_type: "Creation Date",
          value: new Date().toISOString().split('T')[0]
        }
      ]
    };
    
    const tokenURI = await uploadToPinata(selectedFile, metadata);
    
    const tx = await nftContract.methods.mintNFT(recipient, tokenURI).send({
      from: account,
      gas: 500000
    });
    
    alert(`NFT minted successfully! Transaction hash: ${tx.transactionHash}`);
    
    // Clear form
    setSelectedFile(null);
    setFilePreview(null);
    setNftName('');
    setNftDescription('');
    
    // Refresh data AND fetch metadata for the new NFT immediately
    await loadUserData();
    
    // Get the new token ID from the transaction events
    const newTokenId = tx.events.Transfer?.returnValues?.tokenId;
    if (newTokenId && tokenURI) {
      // Fetch metadata for the newly minted NFT
      const newMetadata = await fetchNFTMetadata(tokenURI);
      if (newMetadata) {
        setNftMetadata(prev => ({
          ...prev,
          [newTokenId]: newMetadata
        }));
      }
    }
    
  } catch (error) {
    console.error('Error minting NFT:', error);
    alert('Failed to mint NFT');
  } finally {
    setMintLoading(false);
  }
};

          useEffect(() => {
            if (account) {
              loadUserData();
            }
          }, [account, loadUserData]);

          const formatAddress = (address) => {
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
          };

          const copyToClipboard = (text) => {
            navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
          };

          const displayNFTs = showMyNFTs ? myNfts : nfts

  return (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
              <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">NFT Creator Platform</h1>
                        <p className="text-sm text-gray-300">Total NFTs: {totalSupply}</p>
                      </div>
                    </div>
                    
                    {!account ? (
                      <button
                        onClick={connectWallet}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Wallet className="w-5 h-5" />
                        )}
                        <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                          <div className="text-sm text-gray-300">Creator Tokens</div>
                          <div className="text-xl font-bold text-white">{tokenBalance} CRT</div>
                          <div className="text-xs text-green-400">+{rewardAmount} per NFT</div>
                        </div>
                        <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                          <div className="text-sm text-gray-300">My NFTs</div>
                          <div className="text-xl font-bold text-white">{myNfts.length}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                          <div className="text-sm text-gray-300">Connected</div>
                          <div className="text-white font-mono flex items-center space-x-1">
                            <span>{formatAddress(account)}</span>
                            <Copy 
                              className="w-4 h-4 cursor-pointer hover:text-purple-300" 
                              onClick={() => copyToClipboard(account)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {account && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <div className="grid lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-1">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                          <Upload className="w-6 h-6" />
                          <span>Mint NFT</span>
                        </h2>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Upload File
                            </label>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={handleFileSelect}
                              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            {filePreview && (
                              <div className="mt-3">
                                <img 
                                  src={filePreview} 
                                  alt="Preview" 
                                  className="w-full h-32 object-cover rounded-lg border border-white/20"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              NFT Name *
                            </label>
                            <input
                              type="text"
                              value={nftName}
                              onChange={(e) => setNftName(e.target.value)}
                              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                              placeholder="Enter NFT name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Description
                            </label>
                            <textarea
                              value={nftDescription}
                              onChange={(e) => setNftDescription(e.target.value)}
                              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 h-24 resize-none"
                              placeholder="Describe your NFT"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Mint To Address
                            </label>
                            <input
                              type="text"
                              value={recipient}
                              onChange={(e) => setRecipient(e.target.value)}
                              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono text-sm"
                              placeholder="0x..."
                            />
                          </div>
                          
                          <button
                            onClick={mintNFT}
                            disabled={mintLoading || uploadLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                          >
                            {(mintLoading || uploadLoading) ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Award className="w-5 h-5" />
                            )}
                            <span>
                              {uploadLoading ? 'Uploading to IPFS...' : 
                               mintLoading ? 'Minting...' : 
                               `Mint NFT (+${rewardAmount} CRT)`}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                            <Image className="w-6 h-6" />
                            <span>NFT Gallery</span>
                          </h2>
                          
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setShowMyNFTs(false)}
                              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                !showMyNFTs 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              }`}
                            >
                              All NFTs ({nfts.length})
                            </button>
                            <button
                              onClick={() => setShowMyNFTs(true)}
                              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                                showMyNFTs 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              }`}
                            >
                              <User className="w-4 h-4" />
                              <span>My NFTs ({myNfts.length})</span>
                            </button>
                          </div>
                        </div>
                        
                      {displayNFTs.map((nft) => {
  const metadata = nftMetadata[nft.tokenId];
  return (
    <div key={`${nft.tokenId}-${showMyNFTs}`} className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-200">
     <div className="h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden rounded-t-xl">
  {metadata?.image ? (
    <img 
      src={metadata.image} 
      alt={metadata.name || `NFT #${nft.tokenId}`}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  ) : null}
  <div className="w-full h-full flex items-center justify-center" style={{display: metadata?.image ? 'none' : 'flex'}}>
    <Image className="w-16 h-16 text-white/50" />
  </div>
</div>
      <div className="p-4">
        <div className="font-semibold text-white mb-2">
          {metadata?.name || `NFT #${nft.tokenId}`}
        </div>
        {metadata?.description && (
          <div className="text-sm text-gray-400 mb-2 line-clamp-2">
            {metadata.description}
          </div>
        )}
        <div className="text-sm text-gray-300 space-y-1">
          <div>Creator: {formatAddress(nft.creator)}</div>
          {nft.owner && <div>Owner: {formatAddress(nft.owner)}</div>}
          {nft.creator === account && (
            <div className="text-green-400 text-xs font-medium">
              ✓ Created by you
            </div>
          )}
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => copyToClipboard(nft.tokenURI)}
            className="flex-1 bg-purple-600/20 text-purple-300 py-2 px-3 rounded-lg text-sm hover:bg-purple-600/30 transition-colors flex items-center justify-center space-x-1"
          >
            <Copy className="w-4 h-4" />
            <span>Copy URI</span>
          </button>
          <a
            href={nft.tokenURI}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600/20 text-blue-300 py-2 px-3 rounded-lg text-sm hover:bg-blue-600/30 transition-colors flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
})}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!account && (
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
                    <Award className="w-24 h-24 text-purple-400 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold text-white mb-4">Welcome to NFT Creator Platform</h2>
                    <p className="text-xl text-gray-300 mb-8">
                      Mint NFTs and earn Creator Tokens for every artwork you create
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 text-left">
                      <div className="bg-white/5 rounded-xl p-6">
                        <Upload className="w-8 h-8 text-purple-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Create NFTs</h3>
                        <p className="text-gray-300">Upload your digital art and mint it as an NFT on Lisk Sepolia</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-6">
                        <Award className="w-8 h-8 text-green-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Earn Rewards</h3>
                        <p className="text-gray-300">Get Creator Tokens automatically for every NFT you mint</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-6">
                        <Image className="w-8 h-8 text-blue-400 mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Browse Gallery</h3>
                        <p className="text-gray-300">Explore all minted NFTs and discover amazing digital art</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
  );
}

export default NFTPlatform;