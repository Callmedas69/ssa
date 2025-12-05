// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {SocialScoreAttestator} from "../src/SocialScoreAttestator.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract SocialScoreAttestatorTest is Test {
    SocialScoreAttestator public ssa;

    address public owner = address(this);
    address public backendSigner;
    uint256 public backendSignerPk;
    address public user = address(0x1234);

    // Provider IDs
    bytes32 constant ETHOS = keccak256("ETHOS");
    bytes32 constant NEYNAR = keccak256("NEYNAR");
    bytes32 constant TALENT_BUILDER = keccak256("TALENT_BUILDER");
    bytes32 constant TALENT_CREATOR = keccak256("TALENT_CREATOR");
    bytes32 constant PASSPORT = keccak256("PASSPORT");
    bytes32 constant QUOTIENT = keccak256("QUOTIENT");

    // EIP-712 domain
    bytes32 constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 constant SCORE_PAYLOAD_TYPEHASH =
        keccak256("ScorePayload(address user,uint256 ssaIndex,bytes32[] providers,uint256[] scores,uint256 timestamp)");

    function setUp() public {
        // Generate backend signer
        backendSignerPk = 0xA11CE;
        backendSigner = vm.addr(backendSignerPk);

        // Deploy with proxy
        bytes32[] memory allowedProviders = new bytes32[](6);
        allowedProviders[0] = ETHOS;
        allowedProviders[1] = NEYNAR;
        allowedProviders[2] = TALENT_BUILDER;
        allowedProviders[3] = TALENT_CREATOR;
        allowedProviders[4] = PASSPORT;
        allowedProviders[5] = QUOTIENT;

        SocialScoreAttestator impl = new SocialScoreAttestator();
        bytes memory initData = abi.encodeWithSelector(
            SocialScoreAttestator.initialize.selector,
            backendSigner,
            allowedProviders
        );
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        ssa = SocialScoreAttestator(address(proxy));
    }

    function test_Initialize() public view {
        assertEq(ssa.backendSigner(), backendSigner);
        assertEq(ssa.maxTimestampSkew(), 1 days);
        assertTrue(ssa.isProviderAllowed(ETHOS));
        assertTrue(ssa.isProviderAllowed(NEYNAR));
    }

    function test_SubmitScores() public {
        // Build payload
        bytes32[] memory providers = new bytes32[](6);
        providers[0] = ETHOS;
        providers[1] = NEYNAR;
        providers[2] = TALENT_BUILDER;
        providers[3] = TALENT_CREATOR;
        providers[4] = PASSPORT;
        providers[5] = QUOTIENT;

        uint256[] memory scores = new uint256[](6);
        scores[0] = 44; // ETHOS
        scores[1] = 98; // NEYNAR
        scores[2] = 50; // TALENT_BUILDER
        scores[3] = 31; // TALENT_CREATOR
        scores[4] = 27; // PASSPORT
        scores[5] = 57; // QUOTIENT

        uint256 ssaIndex = 47;
        uint256 timestamp = block.timestamp;

        SocialScoreAttestator.ScorePayload memory payload = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: ssaIndex,
            providers: providers,
            scores: scores,
            timestamp: timestamp
        });

        // Sign payload
        bytes memory signature = _signPayload(payload);

        // Submit as user
        vm.prank(user);
        ssa.submitScores(payload, signature);

        // Verify storage
        assertEq(ssa.ssaIndexScores(user), ssaIndex);

        SocialScoreAttestator.ProviderScore memory ethosScore = ssa.getProviderScore(user, ETHOS);
        assertEq(ethosScore.score, 44);
        assertEq(ethosScore.updatedAt, timestamp);

        SocialScoreAttestator.ProviderScore memory neynarScore = ssa.getProviderScore(user, NEYNAR);
        assertEq(neynarScore.score, 98);
    }

    function test_RevertWhen_CallerNotUser() public {
        bytes32[] memory providers = new bytes32[](1);
        providers[0] = ETHOS;

        uint256[] memory scores = new uint256[](1);
        scores[0] = 50;

        SocialScoreAttestator.ScorePayload memory payload = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 50,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp
        });

        bytes memory signature = _signPayload(payload);

        // Submit from wrong address
        vm.expectRevert(SocialScoreAttestator.CallerNotUser.selector);
        ssa.submitScores(payload, signature);
    }

    function test_RevertWhen_InvalidSignature() public {
        bytes32[] memory providers = new bytes32[](1);
        providers[0] = ETHOS;

        uint256[] memory scores = new uint256[](1);
        scores[0] = 50;

        SocialScoreAttestator.ScorePayload memory payload = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 50,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp
        });

        // Sign with wrong key
        bytes memory badSignature = _signPayloadWithKey(payload, 0xBAD);

        vm.prank(user);
        vm.expectRevert(SocialScoreAttestator.InvalidSignature.selector);
        ssa.submitScores(payload, badSignature);
    }

    function test_RevertWhen_PayloadTooOld() public {
        bytes32[] memory providers = new bytes32[](1);
        providers[0] = ETHOS;

        uint256[] memory scores = new uint256[](1);
        scores[0] = 50;

        SocialScoreAttestator.ScorePayload memory payload = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 50,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp - 2 days // Too old
        });

        bytes memory signature = _signPayload(payload);

        vm.prank(user);
        vm.expectRevert(SocialScoreAttestator.PayloadTooOld.selector);
        ssa.submitScores(payload, signature);
    }

    function test_RevertWhen_ProviderNotAllowed() public {
        bytes32[] memory providers = new bytes32[](1);
        providers[0] = keccak256("UNKNOWN_PROVIDER");

        uint256[] memory scores = new uint256[](1);
        scores[0] = 50;

        SocialScoreAttestator.ScorePayload memory payload = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 50,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp
        });

        bytes memory signature = _signPayload(payload);

        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(SocialScoreAttestator.ProviderNotAllowed.selector, providers[0]));
        ssa.submitScores(payload, signature);
    }

    function test_SetBackendSigner() public {
        address newSigner = address(0xBEEF);

        ssa.setBackendSigner(newSigner);
        assertEq(ssa.backendSigner(), newSigner);
    }

    function test_SetAllowedProvider() public {
        bytes32 newProvider = keccak256("NEW_PROVIDER");

        assertFalse(ssa.isProviderAllowed(newProvider));

        ssa.setAllowedProvider(newProvider, true);
        assertTrue(ssa.isProviderAllowed(newProvider));

        ssa.setAllowedProvider(newProvider, false);
        assertFalse(ssa.isProviderAllowed(newProvider));
    }

    function test_Pause() public {
        // Pause contract
        ssa.pause();

        // Build a valid payload
        bytes32[] memory providers = new bytes32[](1);
        providers[0] = ETHOS;

        uint256[] memory scores = new uint256[](1);
        scores[0] = 50;

        SocialScoreAttestator.ScorePayload memory payload = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 50,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp
        });

        bytes memory signature = _signPayload(payload);

        // Should revert when paused
        vm.prank(user);
        vm.expectRevert();
        ssa.submitScores(payload, signature);

        // Unpause and try again
        ssa.unpause();

        vm.prank(user);
        ssa.submitScores(payload, signature);

        // Verify it worked
        assertEq(ssa.ssaIndexScores(user), 50);
    }

    function test_Version() public view {
        assertEq(ssa.version(), 1);
    }

    function test_RevertWhen_SignatureAlreadyUsed() public {
        bytes32[] memory providers = new bytes32[](1);
        providers[0] = ETHOS;

        uint256[] memory scores = new uint256[](1);
        scores[0] = 50;

        SocialScoreAttestator.ScorePayload memory payload = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 50,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp
        });

        bytes memory signature = _signPayload(payload);

        // First submission should succeed
        vm.prank(user);
        ssa.submitScores(payload, signature);

        // Warp time forward to bypass rate limiting
        vm.warp(block.timestamp + 2 days);

        // Second submission with same signature should fail
        vm.prank(user);
        vm.expectRevert(SocialScoreAttestator.SignatureAlreadyUsed.selector);
        ssa.submitScores(payload, signature);
    }

    function test_RevertWhen_SubmissionTooFrequent() public {
        bytes32[] memory providers = new bytes32[](1);
        providers[0] = ETHOS;

        uint256[] memory scores = new uint256[](1);
        scores[0] = 50;

        SocialScoreAttestator.ScorePayload memory payload1 = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 50,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp
        });

        bytes memory signature1 = _signPayload(payload1);

        // First submission should succeed
        vm.prank(user);
        ssa.submitScores(payload1, signature1);

        // Warp only 12 hours (less than 24 hour cooldown)
        vm.warp(block.timestamp + 12 hours);

        // Create a new payload with new timestamp
        SocialScoreAttestator.ScorePayload memory payload2 = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 55,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp
        });

        bytes memory signature2 = _signPayload(payload2);

        // Second submission should fail due to rate limiting
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                SocialScoreAttestator.SubmissionTooFrequent.selector,
                payload1.timestamp + 1 days
            )
        );
        ssa.submitScores(payload2, signature2);
    }

    function test_SubmitAfterCooldown() public {
        bytes32[] memory providers = new bytes32[](1);
        providers[0] = ETHOS;

        uint256[] memory scores = new uint256[](1);
        scores[0] = 50;

        SocialScoreAttestator.ScorePayload memory payload1 = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 50,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp
        });

        bytes memory signature1 = _signPayload(payload1);

        // First submission
        vm.prank(user);
        ssa.submitScores(payload1, signature1);
        assertEq(ssa.ssaIndexScores(user), 50);

        // Warp 25 hours (past the 24 hour cooldown)
        vm.warp(block.timestamp + 25 hours);

        // Create a new payload with new timestamp and different score
        scores[0] = 75;
        SocialScoreAttestator.ScorePayload memory payload2 = SocialScoreAttestator.ScorePayload({
            user: user,
            ssaIndex: 75,
            providers: providers,
            scores: scores,
            timestamp: block.timestamp
        });

        bytes memory signature2 = _signPayload(payload2);

        // Second submission should succeed after cooldown
        vm.prank(user);
        ssa.submitScores(payload2, signature2);
        assertEq(ssa.ssaIndexScores(user), 75);
    }

    // ------------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------------

    function _signPayload(SocialScoreAttestator.ScorePayload memory payload) internal view returns (bytes memory) {
        return _signPayloadWithKey(payload, backendSignerPk);
    }

    function _signPayloadWithKey(
        SocialScoreAttestator.ScorePayload memory payload,
        uint256 pk
    ) internal view returns (bytes memory) {
        bytes32 domainSeparator = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256("SocialScoreHub"),
                keccak256("1"),
                block.chainid,
                address(ssa)
            )
        );

        bytes32 structHash = keccak256(
            abi.encode(
                SCORE_PAYLOAD_TYPEHASH,
                payload.user,
                payload.ssaIndex,
                keccak256(abi.encodePacked(payload.providers)),
                keccak256(abi.encodePacked(payload.scores)),
                payload.timestamp
            )
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        return abi.encodePacked(r, s, v);
    }
}
