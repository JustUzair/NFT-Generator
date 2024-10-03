// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script} from "forge-std/Script.sol";

import {NFTCollection} from "../src/NFTCollection.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {console2} from "forge-std/console2.sol";

contract MintFromCollection is Script {
    function run() public {
        address collectionAddress = address(0x6EB16a8F13a5ad4193138B6Fbb22D0cDa6340ED1);
        require(collectionAddress != address(0), "collection address is required");
        address erc1155CollectionAddress = address(collectionAddress); // this is op sepolia testnet address only. replace with other to
        HelperConfig helperConfig = new HelperConfig();
        (uint256 deployerKey) = helperConfig.activeNetworkConfig();
        vm.startBroadcast(deployerKey);
        NFTCollection erc1155Collection = NFTCollection(erc1155CollectionAddress);
        NFTCollection(erc1155Collection).mintToSender{value: 0.005 ether}(0);
        NFTCollection(erc1155Collection).mintToSender{value: 0.005 ether}(1);
        NFTCollection(erc1155Collection).mintToSender{value: 0.005 ether}(2);
        NFTCollection(erc1155Collection).mintToSender{value: 0.005 ether}(3);
        NFTCollection(erc1155Collection).mintToSender{value: 0.005 ether}(4);

        vm.stopBroadcast();
        // console.log("nft minted from collection 0 : ",collectionAddress);
    }
}
