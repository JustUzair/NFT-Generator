// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script} from "forge-std/Script.sol";

import {NFTCollection} from "../src/NFTCollection.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {console2} from "forge-std/console2.sol";

contract MintFromCollection is Script {
    function run() public {
        address collectionAddress = address(0x876d8040caf442eCd1164412E40CD54042EE7DbB);
        require(collectionAddress != address(0), "collection address is required");
        address erc1155CollectionAddress = address(collectionAddress); // this is op sepolia testnet address only. replace with other to
        HelperConfig helperConfig = new HelperConfig();
        (uint256 deployerKey) = helperConfig.activeNetworkConfig();
        vm.startBroadcast(deployerKey);
        NFTCollection erc1155Collection = NFTCollection(erc1155CollectionAddress);
        NFTCollection(erc1155Collection).mint(0, 0xA72e562f24515C060F36A2DA07e0442899D39d2c, "");
        NFTCollection(erc1155Collection).mint(1, 0xA72e562f24515C060F36A2DA07e0442899D39d2c, "");

        vm.stopBroadcast();
        // console.log("nft minted from collection 0 : ",collectionAddress);
    }
}
