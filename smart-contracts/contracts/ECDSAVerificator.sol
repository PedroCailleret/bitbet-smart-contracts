// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

//ECDSA signature verificator, OpenZeppelin's ECDSA.sol basically does the same thing

library ECDSAVerificator {
    enum ErrorType {
        Success,
        InvalidSignature,
        InvalidLength,
        InvalidV,
        InvalidS
    }

    // @todo
    /// Optimizational - Gas waste due to long string errors.
    /// Limit revert strings up to 3 words to keep it within 32 bytes
    /// or opt for custom errors and use bytes4 values.
    function _throw(ErrorType error) private pure {
        if (error == ErrorType.InvalidSignature) {
            revert("The ECDSA signature is invalid!");
        } else if (error == ErrorType.InvalidLength) {
            revert("The ECDSA Signature length is invalid!");
        } else if (error == ErrorType.InvalidS) {
            revert(
                "The S value in the ECDSA signature is invalid"
            );
        } else if (error == ErrorType.InvalidV) {
            revert(
                "The V value in the ECDSA signature is invalid"
            );
        } else {
            return;
        }
    }

    function recover(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address, ErrorType) {
        if (signature.length == 65) {
            bytes32 r;
            bytes32 s;
            uint8 v;

            assembly {
                r := mload(add(signature, 0x20))
                s := mload(add(signature, 0x40))
                v := byte(0, mload(add(signature, 0x60)))
            }

            if (
                uint256(s) >
                0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0
            ) {
                return (address(0), ErrorType.InvalidS);
            }

            /// @todo
            /// Optimizational - Remove this check
            /// clients have been copying these unecessary checks since bitcoin-core's ECDSA library
            /// https://github.com/ethereum/yellowpaper/pull/860
            if (v != 27 && v != 28) {
                return (address(0), ErrorType.InvalidV);
            }

            address signer = ecrecover(hash, v, r, s);
            if (signer == address(0)) {
                return (
                    address(0),
                    ErrorType.InvalidSignature
                );
            }

            return (signer, ErrorType.Success);
        } else if (signature.length == 64) {
            bytes32 r;
            bytes32 vs;
            assembly {
                r := mload(add(signature, 0x20))
                vs := mload(add(signature, 0x40))
            }

            bytes32 s = vs &
                bytes32(
                    0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
                );
            uint8 v = uint8((uint256(vs) >> 255) + 27);

            if (
                uint256(s) >
                0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0
            ) {
                return (address(0), ErrorType.InvalidS);
            }

            /// @todo
            /// Optimizational - Remove this check
            /// clients have been copying these unecessary checks since bitcoin-core's ECDSA library
            /// https://github.com/ethereum/yellowpaper/pull/860
            if (v != 27 && v != 28) {
                return (address(0), ErrorType.InvalidV);
            }

            address signer = ecrecover(hash, v, r, s);
            if (signer == address(0)) {
                return (
                    address(0),
                    ErrorType.InvalidSignature
                );
            }

            return (signer, ErrorType.Success);
        } else {
            return (address(0), ErrorType.InvalidLength);
        }
    }

    function toEthMessage(
        bytes32 hash
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    hash
                )
            );
    }
}
