// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CreatorToken
 * @dev ERC20 token that rewards NFT creators
 */
contract CreatorToken is ERC20, Ownable {
    uint256 public constant REWARD_AMOUNT = 100 * 10**18; // 100 tokens per NFT mint

    constructor(address initialOwner) ERC20("CreatorToken", "CRT") Ownable(initialOwner) {
        _mint(initialOwner, 1000000 * 10**18); // 1M tokens
    }

    function rewardCreator(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

/**
 * @title ArtNFT
 * @dev ERC721 NFT collection that rewards creators with ERC20 tokens
 */
contract ArtNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    CreatorToken public immutable creatorToken;

    mapping(uint256 => address) private _creators;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed to,
        string tokenURI,
        uint256 rewardAmount
    );

    constructor() ERC721("ArtNFT", "ART") Ownable(msg.sender) {
        creatorToken = new CreatorToken(address(this));
    }

    function mintNFT(address to, string memory tokenURI_) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        _creators[tokenId] = msg.sender;

        uint256 rewardAmount = creatorToken.REWARD_AMOUNT();
        creatorToken.rewardCreator(msg.sender, rewardAmount);

        emit NFTMinted(tokenId, msg.sender, to, tokenURI_, rewardAmount);
        return tokenId;
    }

   function creatorOf(uint256 tokenId) external view returns (address) {
    require(tokenId < _tokenIdCounter.current(), "ArtNFT: Creator query for nonexistent token");
    return _creators[tokenId];
}



    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function getAllNFTs() external view returns (
        uint256[] memory tokenIds,
        address[] memory creators,
        address[] memory owners,
        string[] memory tokenURIs
    ) {
        uint256 totalTokens = _tokenIdCounter.current();

        tokenIds = new uint256[](totalTokens);
        creators = new address[](totalTokens);
        owners = new address[](totalTokens);
        tokenURIs = new string[](totalTokens);

        for (uint256 i = 0; i < totalTokens; i++) {
            tokenIds[i] = i;
            creators[i] = _creators[i];
            owners[i] = ownerOf(i);
            tokenURIs[i] = tokenURI(i); // use inherited function
        }

        return (tokenIds, creators, owners, tokenURIs);
    }

    function getNFTsByCreator(address creator) external view returns (
        uint256[] memory tokenIds,
        string[] memory tokenURIs
    ) {
        uint256 totalTokens = _tokenIdCounter.current();
        uint256 creatorTokenCount = 0;

        for (uint256 i = 0; i < totalTokens; i++) {
            if (_creators[i] == creator) {
                creatorTokenCount++;
            }
        }

        tokenIds = new uint256[](creatorTokenCount);
        tokenURIs = new string[](creatorTokenCount);

        uint256 index = 0;
        for (uint256 i = 0; i < totalTokens; i++) {
            if (_creators[i] == creator) {
                tokenIds[index] = i;
                tokenURIs[index] = tokenURI(i);
                index++;
            }
        }

        return (tokenIds, tokenURIs);
    }
}
