// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

contract NFTCollection is ERC1155, Ownable, ERC1155Pausable, ERC1155Supply {
    mapping(address holder => mapping(uint256 id => bool isHolding)) public holders;
    // mapping(uint256 id => uint256 supply) public maxSupply;
    string public name;
    string public symbol;

    event NFTCollection__MintedToUser(uint256 indexed id, address indexed to);

    constructor(address initialOwner, string memory _tokenURI, string memory _name, string memory _symbol)
        ERC1155(_tokenURI)
        Ownable(initialOwner)
    {
        name = _name;
        symbol = _symbol;
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
    function mint(uint256 id, address receiver, bytes memory data) public {
        require(!holders[receiver][id], "Already Minted");
        _mint(receiver, id, 1, data);
        holders[receiver][id] = true;
        emit NFTCollection__MintedToUser(id, receiver);
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
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    // function getMaxSupply(uint256 id) public view returns (uint256) {
    //     return maxSupply[id];
    // }

    // function setMaxSupply(uint256 id, uint256 _newSupplyLimit) public onlyOwner {
    //     maxSupply[id] = _newSupplyLimit;
    // }
}
