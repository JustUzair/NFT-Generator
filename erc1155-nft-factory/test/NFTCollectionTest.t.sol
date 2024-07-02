// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test} from "forge-std/Test.sol";

import {NFTCollection} from "../src/NFTCollection.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {console2} from "forge-std/console2.sol";

contract NFTCollectionTest is Test {
    address owner = makeAddr("owner");
    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");

    NFTCollection erc1155Collection;

    function setUp() public {
        vm.startBroadcast(owner);
        erc1155Collection =
            new NFTCollection(owner, "ipfs://QmRaNapy2YG1iF8yywdJGn5BehDc4RyxxUMM49uK7D8MXv/", "Kyte Sprint", "SPRNT");
        erc1155Collection.mint(0, owner, "");
        erc1155Collection.mint(1, owner, "");

        console2.log("erc1155Collection deployed at : ", address(erc1155Collection));
        vm.stopBroadcast();

        console2.log("owner : ", owner);
        console2.log("user1 : ", user1);
        console2.log("user2 : ", user2);
    }

    function test_getNftUri() public view {
        string memory uri = erc1155Collection.uri(0);
        console2.log("uri : ", uri);
    }

    function test_MintToOwnerMultipleTimes() public {
        vm.startBroadcast(owner);
        vm.expectRevert(bytes("Already Minted"));
        erc1155Collection.mint(0, owner, "");
        vm.stopBroadcast();
    }

    function test_MintToNonOwner() public {
        vm.startBroadcast(user1);
        erc1155Collection.mint(0, user1, "");
        erc1155Collection.mint(1, user1, "");
        vm.stopBroadcast();
        assert(erc1155Collection.balanceOf(user1, 0) == 1 && erc1155Collection.balanceOf(user1, 1) == 1);
    }

    function test_MintBatchByOwner() public {
        vm.startBroadcast(owner);
        uint256[] memory ids = new uint256[](2);
        ids[0] = 0;
        ids[1] = 1;

        uint256[] memory amountForEachId = new uint256[](2);
        amountForEachId[0] = 1;
        amountForEachId[1] = 1;
        erc1155Collection.mintBatch(user2, ids, amountForEachId, "");

        uint256 id1Balance = IERC1155(erc1155Collection).balanceOf(user2, 0);
        uint256 id2Balance = IERC1155(erc1155Collection).balanceOf(user2, 1);

        vm.stopBroadcast();
        assert(id1Balance == 1 && id2Balance == 1);
    }

    function test_newTokenIdByOwner() public {
        vm.startBroadcast(owner);
        erc1155Collection.mint(2, owner, "");
        vm.stopBroadcast();
        assert(erc1155Collection.balanceOf(owner, 2) == 1);
    }

    function test_newTokenIdByNonOwner() public {
        vm.startBroadcast(user1);
        erc1155Collection.mint(2, user1, "");
        vm.stopBroadcast();
        assert(erc1155Collection.balanceOf(user1, 2) == 1);
    }
}
