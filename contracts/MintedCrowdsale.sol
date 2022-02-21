//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./Crowdsale.sol";
import "./MyERC20Mintable.sol";

/**
 * @title MintedCrowdsale
 * @dev Extension of Crowdsale contract whose tokens are minted in each purchase.
 * Token ownership should be transferred to MintedCrowdsale for minting.
 */
contract MintedCrowdsale is Crowdsale {
    constructor(
        uint256 rate_,
        address payable wallet_,
        IERC20 token_
    ) Crowdsale(rate_, wallet_, token_) {}

    /**
     * @dev Overrides delivery by minting tokens upon purchase.
     * @param beneficiary Token purchaser
     * @param tokenAmount Number of tokens to be minted
     */
    function _deliverTokens(address beneficiary, uint256 tokenAmount)
        internal
        override
    {
        // Potentially dangerous assumption about the type of the token.
        require(
            // Let's hope this is the real token we intend to mint
            MyERC20Mintable(address(token())).mint(beneficiary, tokenAmount),
            "MintedCrowdsale: minting failed"
        );
    }
}
