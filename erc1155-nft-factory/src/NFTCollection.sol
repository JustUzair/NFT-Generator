// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {MockUSDC} from "./ERC20/MockUSDC.sol";

contract NFTCollection is ERC1155, Ownable, ERC1155Pausable, ERC1155Supply {
    mapping(address holder => mapping(uint256 id => bool isHolding)) public holders;
    mapping(address user => uint256[] tokenIds) public userNFTs;

    // mapping(uint256 id => uint256 supply) public maxSupply;
    string public name;
    string public symbol;
    string public CONTRACT_URI;
    uint256 etherPrice;
    uint256 usdcPrice; // amount of tokens to be sent for minting nft
    uint256 artistRevenue;
    address usdcToken;

    event NFTCollection__MintedToUser(uint256 indexed id, address indexed to);

    constructor(
        address initialOwner,
        string memory _tokenURI,
        string memory _name,
        string memory _symbol,
        uint256 _price,
        address _udscToken,
        uint256 _usdcPrice
    ) ERC1155(_tokenURI) Ownable(initialOwner) {
        name = _name;
        symbol = _symbol;
        etherPrice = _price;
        usdcPrice = _usdcPrice;
        usdcToken = _udscToken;
    }

    function setContractURI(string memory _newURI) public onlyOwner {
        CONTRACT_URI = _newURI;
    }

    /**
     * @dev returns the URI for a token ID from IPFS Folder
     */
    function uri(uint256 _id) public view virtual override returns (string memory) {
        require(exists(_id), "nonexistent token");
        return string(abi.encodePacked(super.uri(_id), Strings.toString(_id), ".json"));
    }

    // @notice - Set the URI for all token types
    function setURI(string memory _newURI) public onlyOwner {
        _setURI(_newURI);
    }

    // @notice - Pause the contract to prevent any minting or transfers
    function pause() public onlyOwner {
        _pause();
    }

    // @notice - Unpause the contract to prevent any minting or transfers
    function unpause() public onlyOwner {
        _unpause();
    }

    // @notice - Mint a token to msg.sender
    // @dev - Mint a token to msg.sender
    // @param - id: The id of the token to mint
    // @param - data: extra data to add for minting the token
    function mint(uint256 id, address receiver, bytes memory data) public payable {
        require(!holders[receiver][id], "Already Minted");
        if (msg.value > 0) {
            require(msg.value == etherPrice, "Incorrect Price");
            artistRevenue += msg.value;
        } else {
            require(msg.value == 0, "Cannot purchase with ether when using USDC.");
            bool success = IERC20(usdcToken).transferFrom(msg.sender, owner(), usdcPrice);
            require(success, "Transfer failed.");
        }
        holders[receiver][id] = true;
        userNFTs[receiver].push(id);
        _mint(receiver, id, 1, data);
        emit NFTCollection__MintedToUser(id, receiver);
    }

    // @param - id of token to mint to msg.sender
    function mintToSender(uint256 id) public payable {
        require(!holders[msg.sender][id], "Already Minted");
        if (msg.value > 0) {
            require(msg.value == etherPrice, "Incorrect Price");
            artistRevenue += msg.value;
        } else {
            require(msg.value == 0, "Cannot purchase with ether when using USDC.");
            bool success = IERC20(usdcToken).transferFrom(msg.sender, owner(), usdcPrice);
            require(success, "Transfer failed.");
        }
        holders[msg.sender][id] = true;
        userNFTs[msg.sender].push(id);
        _mint(msg.sender, id, 1, bytes(""));
        emit NFTCollection__MintedToUser(id, msg.sender);
    }

    // @notice - mintBatch is used to mint multiple tokens to an address
    // @dev - Mint a batch of tokens to an address
    // @param - to: The address to mint tokens to
    // @param - ids: The array of ids of the tokens to mint
    // @param - amounts: The array of amounts of the tokens to mint
    // @param - data: extra data to add for minting the tokens
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < ids.length; i++) {
            require(!holders[to][ids[i]], "Already Minted");
            holders[to][ids[i]] = true;
            userNFTs[to].push(ids[i]);
        }
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    function getNFTPrice() public view returns (uint256) {
        return etherPrice;
    }

    function setNFTPrice(uint256 _newPrice) public onlyOwner {
        etherPrice = _newPrice;
    }

    function getUserNFTs(address _user) public view returns (uint256[] memory) {
        return userNFTs[_user];
    }

    function withdrawRevenue() public onlyOwner {
        require(artistRevenue > 0, "No revenue to withdraw");
        uint256 _artistRevenue = artistRevenue;
        artistRevenue = 0;
        (bool success,) = address(owner()).call{value: _artistRevenue}("");
        require(success, "Transfer failed.");
    }

    function getWithdrawableRevenue() public view returns (uint256) {
        return artistRevenue;
    }

    // function getMaxSupply(uint256 id) public view returns (uint256) {
    //     return maxSupply[id];
    // }

    // function setMaxSupply(uint256 id, uint256 _newSupplyLimit) public onlyOwner {
    //     maxSupply[id] = _newSupplyLimit;
    // }
}
