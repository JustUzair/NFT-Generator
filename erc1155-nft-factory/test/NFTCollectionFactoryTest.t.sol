// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test} from "forge-std/Test.sol";

import {NFTCollection} from "../src/NFTCollection.sol";
import {NFTCollectionFactory} from "../src/NFTCollectionFactory.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {console2} from "forge-std/console2.sol";
import {console} from "forge-std/console.sol";

contract NFTCollectionFactoryTest is Test {
    address owner = makeAddr("owner");
    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");

    NFTCollection erc1155Collection;
    NFTCollectionFactory factory;

    function setUp() public {
        vm.deal(owner, 1000 ether);
        vm.deal(user1, 1000 ether);
        vm.deal(user2, 1000 ether);

        vm.startBroadcast(owner);
        factory = new NFTCollectionFactory(owner);
        console2.log("erc1155CollectionFactory deployed at : ", address(factory));
        vm.stopBroadcast();

        console2.log("owner : ", owner);
        console2.log("user1 : ", user1);
        console2.log("user2 : ", user2);
    }

    function test_createCollection() public {
        vm.startBroadcast(owner);
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 1", "SPRNT-1", 0.05 ether
        );
        vm.stopBroadcast();
    }

    function test_createMultipleCollections() public {
        vm.startBroadcast(owner);
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 1", "SPRNT-1", 0.05 ether
        );
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 2", "SPRNT-2", 0.05 ether
        );
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 3", "SPRNT-3", 0.05 ether
        );
        vm.stopBroadcast();
    }

    modifier _createMultipleCollections() {
        vm.startBroadcast(owner);
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 1", "SPRNT-1", 0.05 ether
        );
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 2", "SPRNT-2", 0.05 ether
        );
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 3", "SPRNT-3", 0.05 ether
        );
        NFTCollection(factory.getUserCollections(owner)[0]).mint{value: 0.05 ether}(0, owner, "");
        NFTCollection(factory.getUserCollections(owner)[0]).mint{value: 0.05 ether}(1, owner, "");

        NFTCollection(factory.getUserCollections(owner)[1]).mint{value: 0.05 ether}(0, owner, "");
        NFTCollection(factory.getUserCollections(owner)[1]).mint{value: 0.05 ether}(1, owner, "");

        NFTCollection(factory.getUserCollections(owner)[2]).mint{value: 0.05 ether}(0, owner, "");
        NFTCollection(factory.getUserCollections(owner)[2]).mint{value: 0.05 ether}(1, owner, "");
        vm.stopBroadcast();
        _;
    }

    function test_getUserCollections() public _createMultipleCollections {
        address[] memory collections = factory.getUserCollections(owner);
        assert(collections.length == 3);
    }

    function test_getAllCollections() public _createMultipleCollections {
        vm.startBroadcast(user1);
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 1", "SPRNT-1", 0.05 ether
        );
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 2", "SPRNT-2", 0.05 ether
        );
        factory.createCollection(
            "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint 3", "SPRNT-3", 0.05 ether
        );
        vm.stopBroadcast();
        address[] memory collections = factory.getAllCollections();
        assert(collections.length == 6);
    }

    function test_MintFromCollection() public _createMultipleCollections {
        address[] memory collections = factory.getUserCollections(owner);
        vm.startPrank(user1);
        NFTCollection(collections[0]).mint{value: 0.05 ether}(0, user1, "");
        assert(NFTCollection(collections[0]).balanceOf(user1, 0) == 1);
    }

    function test_MintMultipleTimes() public _createMultipleCollections {
        address[] memory collections = factory.getUserCollections(owner);
        vm.startBroadcast(user1);
        NFTCollection(collections[0]).mint{value: 0.05 ether}(0, user1, "");
        vm.expectRevert(bytes("Already Minted"));
        NFTCollection(collections[0]).mint{value: 0.05 ether}(0, user1, "");
        vm.stopBroadcast();
        console2.log(NFTCollection(collections[0]).balanceOf(user1, 0));
    }

    function test_MintBatchByCollectionOwner() public _createMultipleCollections {
        address[] memory collections = factory.getUserCollections(owner);
        vm.startBroadcast(owner);
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 1;

        uint256[] memory amountForEachId = new uint256[](2);
        amountForEachId[0] = 1;
        amountForEachId[1] = 1;
        NFTCollection(collections[0]).mintBatch(user2, ids, amountForEachId, "");
        vm.stopBroadcast();
        // console2.log(NFTCollection(collections[0]).balanceOf(user2, 0));
        // console2.log(NFTCollection(collections[0]).balanceOf(user2, 1));
        assert(NFTCollection(collections[0]).balanceOf(user2, 0) == 1);
        assert(NFTCollection(collections[0]).balanceOf(user2, 1) == 1);
    }

    function test_MintBatchByNonOwner() public _createMultipleCollections {
        address[] memory collections = factory.getUserCollections(owner);
        vm.startBroadcast(user1);
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 1;

        uint256[] memory amountForEachId = new uint256[](2);
        amountForEachId[0] = 1;
        amountForEachId[1] = 1;

        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
        NFTCollection(collections[0]).mintBatch(user2, ids, amountForEachId, "");
        vm.stopBroadcast();
    }

    function test_getNftUriForCollection() public _createMultipleCollections {
        address[] memory collections = factory.getUserCollections(owner);

        for (uint256 i = 0; i < collections.length; i++) {
            console2.log("collection ", i);
            for (uint256 j = 0; j < 2; j++) {
                string memory uri = NFTCollection(collections[i]).uri(j);
                console2.log("uri :", j, uri);
            }
        }
    }
}
