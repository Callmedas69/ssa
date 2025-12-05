// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SocialScoreAttestator} from "../src/SocialScoreAttestator.sol";
import {ProfileSBT} from "../src/ProfileSBT.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployScript is Script {
    // Provider IDs (keccak256 of provider names)
    bytes32 constant ETHOS = keccak256("ETHOS");
    bytes32 constant NEYNAR = keccak256("NEYNAR");
    bytes32 constant TALENT_BUILDER = keccak256("TALENT_BUILDER");
    bytes32 constant TALENT_CREATOR = keccak256("TALENT_CREATOR");
    bytes32 constant PASSPORT = keccak256("PASSPORT");
    bytes32 constant QUOTIENT = keccak256("QUOTIENT");

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address backendSigner = vm.envAddress("BACKEND_SIGNER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SocialScoreAttestator
        bytes32[] memory allowedProviders = new bytes32[](6);
        allowedProviders[0] = ETHOS;
        allowedProviders[1] = NEYNAR;
        allowedProviders[2] = TALENT_BUILDER;
        allowedProviders[3] = TALENT_CREATOR;
        allowedProviders[4] = PASSPORT;
        allowedProviders[5] = QUOTIENT;

        // Deploy implementation
        SocialScoreAttestator ssaImpl = new SocialScoreAttestator();
        console.log("SocialScoreAttestator Implementation:", address(ssaImpl));

        // Deploy proxy with initialization
        bytes memory ssaInitData = abi.encodeWithSelector(
            SocialScoreAttestator.initialize.selector,
            backendSigner,
            allowedProviders
        );
        ERC1967Proxy ssaProxy = new ERC1967Proxy(address(ssaImpl), ssaInitData);
        console.log("SocialScoreAttestator Proxy:", address(ssaProxy));

        // Optional: Deploy ProfileSBT
        // Uncomment when ready to deploy ProfileSBT
        /*
        ProfileSBT sbtImpl = new ProfileSBT();
        console.log("ProfileSBT Implementation:", address(sbtImpl));

        bytes memory sbtInitData = abi.encodeWithSelector(
            ProfileSBT.initialize.selector,
            backendSigner,         // voucherSigner
            address(ssaProxy),     // scoreAttestator
            "Social Score Profile",
            "SSP",
            "https://api.example.com/metadata/"
        );
        ERC1967Proxy sbtProxy = new ERC1967Proxy(address(sbtImpl), sbtInitData);
        console.log("ProfileSBT Proxy:", address(sbtProxy));
        */

        vm.stopBroadcast();
    }
}
