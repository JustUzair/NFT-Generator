// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

import {NFTCollection} from "../src/NFTCollection.sol";
import {NFTCollectionFactory} from "../src/NFTCollectionFactory.sol";

import {console2} from "forge-std/console2.sol";

contract ERC1155CollectionDeployScript is Script {
    // address owner = makeAddr("owner");
    NFTCollection erc1155Collection;
    NFTCollectionFactory collectionFactory;

    function run() public {
        HelperConfig helperConfig = new HelperConfig();

        (uint256 deployerKey) = helperConfig.activeNetworkConfig();
        vm.startBroadcast(deployerKey);
        collectionFactory = new NFTCollectionFactory(0xA72e562f24515C060F36A2DA07e0442899D39d2c);
        erc1155Collection = NFTCollection(
            collectionFactory.createCollection(
                "ipfs://QmVt4HPw6auonVSRA3vxbcaHiREwBcrXnrGJYWaGbRCtFd/", "BoredHippie", "BoredHippie", 0.000005 ether
            )
        );
        console2.log("collectionFactory deployed at : ", address(collectionFactory));
        console2.log("erc1155Collection deployed at : ", address(erc1155Collection));

        vm.stopBroadcast();
    }
}
