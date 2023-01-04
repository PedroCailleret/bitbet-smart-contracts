// SPDX-License-Identifier: GPL-3.0

/// @notice All natspec comments were added by the auditor,
/// all original comments (not following natspect rules)
/// were also left in; audit's comments were added under
/// @audit and @todo tags.

// @todo pentest leftover ideas:
/// @audit try to inject assembly jumpdest calls to
/// other functions in order to bypass auth/visibility
/// (e.g., add(mload(targetfx), callvalue()) ∴
/// callvalue := destination swap)
/// @audit check for open injectors to delegatecall upon
/// @audit tighten fuzzer input range,
/// from minR to maxR, for x ∴ x := x % maxR + minR

// @todo - Avoid unspecifying pragma version for non-libraries (Mild)
/// A known compiler version containing vulnerabilities may be used
/// https://consensys.net/diligence/audits/2020/12/1inch-liquidity-protocol/#unspecific-compiler-version-pragma
pragma solidity >=0.8.0 <0.9.0;

//standard test
//Kucoin bridge
//TODO: Remove this in production (Used only for testing the ERC20 transfers)

// @todo - Use named import synthax (Correctness/Non-Critical Issues)
/// Explicitly name contracts imports to avoid ambiguity and complexity masking.
/// e.g., import {symbol1 as alias, symbol2} from "filename";
// https://docs.soliditylang.org/en/v0.8.15/layout-of-source-files.html#importing-other-source-files
// import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

//ownable pausable
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ECDSAVerificator.sol";

contract Payment is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev Storage layout:
    /// +-------------------------------------------------+--------------------------+------+--------+
    /// |                       Name                      |           Type           | Slot | Offset |
    /// +-------------------------------------------------+--------------------------+------+--------+
    /// |             ReentrancyGuard._status             |         uint256          |  0   |   0    |
    /// |                  Payment.nonces                 | mapping(uint256 => bool) |  1   |   0    |
    /// |             Payment.pausedTimestamp             |         uint256          |  2   |   0    |
    /// |                Payment.nonceState               |         uint256          |  3   |   0    |
    /// |                Payment.pausedFor                |         uint256          |  4   |   0    |
    /// |   Payment.dailyWithdrawalLimitInWBTCBaseUnits   |         uint256          |  5   |   0    |
    /// | Payment.dailyWithdrawalLimitInWBTCBaseUnitsInit |         uint256          |  6   |   0    |
    /// |       Payment.lastWithdrawalLimitTimestamp      |         uint256          |  7   |   0    |
    /// |     Payment.lastWithdrawalCommitedTimestamp     |         uint256          |  8   |   0    |
    /// |               Payment.WBTCAddress               |         address          |  9   |   0    |
    /// |               Payment.USDCAddress               |         address          |  10  |   0    |
    /// |                  Payment.owner                  |         address          |  11  |   0    |
    /// |                Payment.publicKey                |          bytes           |  12  |   0    |
    /// |              Payment.pubkeyaddress              |         address          |  13  |   0    |
    /// +-------------------------------------------------+--------------------------+------+--------+
    // @todo Explicity mark mapping visibility.
    /// This state variable visibility is set to internal by default; consider
    /// explicitly marking visibility of state for correctness and disambiguation sake.
    /// As comment thereafter in the Solidity docs:
    /// https://solidity.readthedocs.io/en/develop/contracts.html#visibility-and-getters
    mapping(uint256 => bool) nonces;

    // @todo
    /// Optimizational - No need to initialize it to default value.
    /// Initializing storage to 0 wastes a lot of gas in deployment.

    /// @notice The last recorded block.timestamp from when the contract was paused.
    /// @dev This state variable is updated to `block.timestamp` by
    /// the `pause` function and zeroed out by the `resume` function.
    ///
    /// @dev As long as the `block.timestamp` is less than this value added to
    /// `pauseFor`, all functions restricted by the `requireNotPaused` modifier
    /// (`deposit`, `withdraw`, `deposit` and `depositERC`) are paused.
    uint256 private pausedTimestamp = 0;

    /// @notice Counter value used by `withdraw` and `withdrawERC` functions.
    /// @dev The provided `nonce` parameter of herein referred functions must
    /// be less than `nonceState` + 1 for a function call not to revert.
    uint256 private nonceState = 0;

    /// @notice The time span that the contract will be paused for.
    /// @dev This state variable get mutated by the `pause` function
    /// and added to `pausedTimestamp` within `requireNotPaused` modifier control flow.
    ///
    /// @dev As long as the `block.timestamp` is less than this value added to
    /// `pauseFor`, all functions restricted by the `requireNotPaused` modifier
    /// (`deposit`, `withdraw`, `deposit` and `depositERC`) are paused.
    uint256 private pausedFor = 7 days;

    /// @notice This value represents the remaining daily withdraw limit in the WBTC scalar (1e8).
    /// @dev It gets initialized in the constructor and deduced from each withdraw call both from
    /// `withdraw` and `withdrawERC` functions. It gets deduced from the passed in amount when
    /// WBTC is withdrawn; and from the passed in amount converted to WBTC when USDC or ETH are
    /// withdrawn; assuming a hardcoded convertion rate (1 BTC : 10 ETH : 10_000 USDC).
    ///
    /// @dev This value gets reset to it's initial value (i.e., `dailyWithdrawalLimitInWBTCBaseUnitsInit`)
    /// everytime the `resetWithdrawalLimit` external function gets called.
    ///
    /// @dev This value cannot be reset for at least 24 hours after the last reset.
    uint256 private dailyWithdrawalLimitInWBTCBaseUnits;

    // @todo
    /// Optimizational - Declare state variable as immutable
    /// `dailyWithdrawalLimitInWBTCBaseUnitsInit` gets initalized in the constructor
    /// and never gets mutated; thus, it could be declared as immutable in order to
    /// avoid taking uncessary storage space.

    /// @notice The initial remaining daily withdraw limit in the WBTC scalar (1e8).
    /// @dev It gets initialized in the constructor and does not get mutated elsewhere.
    ///
    /// @dev `dailyWithdrawalLimitInWBTCBaseUnits` gets reset to this value everytime
    /// the `resetWithdrawalLimit` gets successfully called.
    uint256 private dailyWithdrawalLimitInWBTCBaseUnitsInit;

    /// @notice The last recorded block.timestamp from when `resetWithdrawalLimit` was called.
    /// @dev It gets checked against current block.timestamp to ensure that at least 24 hours
    /// have passed since the last time `resetWithdrawalLimit` was successfully called.
    ///
    /// @dev It gets wrtitten to the current block.timestamp everytime `resetWithdrawalLimit`
    /// gets successfully called.
    uint256 private lastWithdrawalLimitTimestamp = 0;

    /// @notice The block.timestamp from the last withdraw made on the contract.
    /// @dev This ensures that the publicKey will not be updated for a minimum of
    /// 180 days following the last withdrawal.
    ///
    /// @dev Gets uptated to the current block.timestamp everytime `withdraw`
    /// or `withdrawERC` gets called.
    uint256 private lastWithdrawalCommitedTimestamp = 0;

    // @todo
    /// Optimizational - Declare addresses as constant
    /// `WBTCAddress` and `USDCAddress` can be declared as constant so to allow the evm
    /// to optimize how the value is read from the contract's creation code.

    /// @notice The Wrapped Bitcoin deployment address on the Ethereum Mainnet.
    /// @dev Referenced in `validateCurrency` in order to ensure that a valid ERC20 token
    /// is being deposited or withdrawan from the contract.
    address private WBTCAddress =
        0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;

    /// @notice The USD Coin deployment address on the Ethereum Mainnet.
    /// @dev Referenced in `validateCurrency` in order to ensure that a valid ERC20 token
    /// is being deposited or withdrawan from the contract.
    address private USDCAddress =
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    // @todo - It is advisable to turn this into a mutable state variable.
    /// Ensuring that ownership of the contract can be transferred safely can be
    /// an useful consideration in case any issues with current owner happen.

    /// @notice The address authorized to call restricted functions.
    /// @dev Functions protected by the restricted modifier: `pause`, `resume` and `changePubKey`.
    /// @dev It is not possible to transfer ownership of the contract to any other account/contract.
    address payable private immutable owner;

    /// @notice The public key that generates the `pubkeyaddress`.
    /// @dev It gets updated by the `changePubKey` function.
    bytes private publicKey;

    /// @notice The signer address used for message validation.
    /// @dev It gets initialized in the constructor but does not get mutated elsewhere.
    /// @dev From the Ethereum documentation:
    /// You get a public address for your account by taking the last 20 bytes
    /// of the Keccak-256 hash of the public key and adding 0x to the beginning.
    address private pubkeyaddress;

    // @todo - Correctness/Non-Critical Issues
    /// Emit `msg.sender` and relevant actors as indexed
    /// event parameters for all events seeing to ease frontend
    /// and offchain scripts event filtering.

    // @todo
    /// Optimizational - Remove unused event.
    /// `Validate` event isn't implemented by the contract. This can
    /// sugest architectural errors.

    /// @dev Unused event.
    event Validate(
        address recovered,
        address owner,
        ECDSAVerificator.ErrorType errorType
    );
    //indexed

    /// @dev Event emitted by the `deposit` function.
    /// @dev Event signature:
    /// (keccak256(bytes("Deposited(address,uint256,uint256)")) :=
    /// 0x73a19dd210f1a7f902193214c0ee91dd35ee5b4d920cba8d519eca65a7b488ca
    event Deposited(
        address indexed sender,
        uint256 amount,
        uint256 userId
    );

    /// @dev Event emitted by the `withdraw` function.
    /// @dev Event signature:
    /// (keccak256(bytes("Withdraw(address,uint256)")) :=
    /// 0x884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364
    event Withdraw(address receiver, uint256 amount);
    event ERC20Deposited(
        address from,
        uint256 amount,
        address tokenAddress
    );
    /// @dev Event emitted by the `withdrawERC` function.
    /// @dev Event signature:
    /// (keccak256(bytes("ERC20Withdraw(address,uint256,address)")) :=
    /// 0xf6ec5aa090c5e0f965cb680d7b2bb31073063aa12e87945c18f82b616f8b0050
    event ERC20Withdraw(
        address to,
        uint256 amount,
        address tokenAddress
    );

    constructor(
        uint256 _dalyWithdrawalLimit,
        bytes memory _publicKey
    ) {
        owner = payable(msg.sender);
        // @todo - Correctness/Non-Critical Issues
        /// State variables initialized in the constructor should
        /// be logged in an event everytime they mutate via other functions.
        dailyWithdrawalLimitInWBTCBaseUnits = _dalyWithdrawalLimit;
        dailyWithdrawalLimitInWBTCBaseUnitsInit = _dalyWithdrawalLimit;
        // @todo - Optimizational
        /// Useless extra storage variable and onchain address generation from publicKey.
        /// Consider directly passing the signer address as a constructor paremeter and
        /// getting rid of publicKey. You can also optimize storage by casting the address
        /// either to `uint256` or to a `bytes32` with safe type casts.
        /// e.g.:
        /// uint256 addrCasted = uint256(uint160(_addr)) << 12;
        /// bytes32 addrCasted = bytes32(bytes20(_addr));

        publicKey = _publicKey;
        pubkeyaddress = address(
            uint160(uint256(keccak256(publicKey)))
        );
        // @todo
        /// Optimizational - Gas waste due to long string errors.
        /// Limit revert strings up to 3 words to keep it within 32 bytes
        /// or opt for custom errors and use bytes4 values.
        require(
            pubkeyaddress != address(0),
            "Validation: Invalid recovered address"
        );
    }

    //private

    /// @notice Auxiliar private method that updates `nonces` storage mapping
    /// and perform equality comparisson of `pubkeyaddress` state variable and
    /// the address ecrecovered from the signed message assembled from inputed
    /// parameters and a provided signature.
    ///
    /// @dev User input validity is asserted offchain; besides
    /// signature malleability, security considerations are out
    /// of scope of this contract.
    ///
    /// @dev This function is referenced in 2 other methods
    /// (i.e., `withdraw` and `withdrawERC`).
    /// @dev Function sighash := 0x85749211
    function _validate(
        uint256 amount,
        uint256 nonce,
        uint8 currency,
        bytes32 txid,
        address receiver,
        bytes memory signature
    ) private {
        require(!nonces[nonce], "Nonce existent");
        nonces[nonce] = true;
        bytes32 message = toHashMessage(
            amount,
            nonce,
            currency,
            txid,
            receiver
        );
        address recoveredAddress;
        ECDSAVerificator.ErrorType errorType;
        bytes32 ethMessageHash = ECDSAVerificator
            .toEthMessage(message);
        (recoveredAddress, errorType) = ECDSAVerificator
            .recover(ethMessageHash, signature);
        // emit Validate(recoveredAddress, msg.sender, errorType);

        // @todo
        /// Optimizational - Gas waste due to long string errors.
        /// Limit revert strings up to 3 words to keep it within 32 bytes
        /// or opt for custom errors and use bytes4 values.
        require(
            errorType == ECDSAVerificator.ErrorType.Success,
            "Validation : Verification failed"
        );

        require(
            recoveredAddress == pubkeyaddress,
            "Validation : Recovered address does not match with the public key's address"
        );
    }

    //nonReentrant

    /// @notice Method that enables an external actor to deposit ETH into the contract.
    ///
    /// @dev Since this contract doesn't have any receive/payable fallback logic, this method
    /// and the `withdraw` function are the only standard ways for the contract to receive ETH.
    ///
    /// @dev Note that there are still inderect ways to force ETH into the contract.
    ///
    /// @param userId An deposit user identifier not written to contract's storage; and emitted
    /// in the `Deposited` event.
    ///
    /// @dev `msg.sender` and `msg.value` also emitted in the `Deposited` event.
    ///
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0xb6b55f25
    function deposit(
        uint256 userId
    ) external payable requireNotPaused {
        // @todo
        /// Optimizational - Use `!= 0` instead of `> 0`.
        /// When comparing to zero, using the evm `iszero`
        /// opcode , (i.e., `iszero(userId)`) saves more gas than using `gt(userId, 0x0)`.

        // @todo
        /// Optimizational - Gas waste due to long string errors.
        /// Limit revert strings up to 3 words to keep it within 32 bytes
        /// or opt for custom errors and use bytes4 values.
        require(userId > 0, "User ID must be greater than 0");
        emit Deposited(msg.sender, msg.value, userId);
    }

    //nonReentrant

    /// @notice ETH withdraw method that also receives ether.
    /// @dev Since this contract doesn't have any receive/payable fallback logic, this method
    /// and the `deposit` function are the only standard ways for the contract to receive ETH.
    /// @dev Note that there are still inderect ways to force ETH into the contract.
    /// @dev Both `withdraw` and `withdrawERC` use the same nonce whilst validating messages
    /// and checking against storage within control flow.
    /// @dev Frontend should estimate the `nonceState` through event emission of both
    /// `withdraw` and `withdrawERC` functions; since the contract does not provide
    /// a way to fetch such state variable.
    ///
    /// @param amount The amount of ETH wished to be withdrawn from contract's balance. This
    /// parameter will be checked against the contract balance within the control flow; provided
    /// as part of the signed message to be validated; and then converted to
    /// the WBTC scalar (1e8), so to be decreased, as `limitInWBTCBaseUnits`, from the
    /// `dailyWithdrawalLimitInWBTCBaseUnits` state variable. Parameter emitted in event `Withdraw`.
    ///
    /// @param nonce The nonce value used as a counter to prevent signature replay attacks;
    /// must be always less than current `nonceState` value +1. This value will return true
    /// if provided as a key entry of the nonces mapping once this function call is succeeded.
    ///
    /// @param receiver The address entitled to receive the withdrawn contract balance. This
    /// parameter is provided as part of the signed message to be validated by `_validate` fx;
    /// then used in low level call as the recipient for where the funds will be sent to.
    /// Parameter emitted in event `Withdraw`.
    ///
    /// @param currency The 8 bit unsigned integer that will revert within control flow
    /// if its value isn't 1. The value gets provided as part of the signed message to be validated;
    /// then, the parameter serves as path selector for the `_validateAndGetWithdrawalLimit` function.
    ///
    /// @param txid The `bytes32` transaction identifier only used for signed message validation.
    ///
    /// @param signature The offchain generated signature used in `ecrecover`. Constituted by
    /// the concatenation of the splitted signature (i.e., r,s,v).
    ///
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0x11bd1621
    function withdraw(
        uint256 amount,
        uint256 nonce,
        address receiver,
        // @todo - Optimizational
        /// No need to pass currency as a parameter since this
        /// function only deals with ETH (i.e., 1).
        /// Consider removing both: `currency` parameter and `require(currency == 1)`;
        /// then hardcode 1 for both validating methods
        /// (i.e., `_validate` and `_validateAndGetWithdrawalLimit`).
        uint8 currency,
        bytes32 txid,
        bytes memory signature
    ) external payable requireNotPaused {
        nonceState++;
        require(nonceState > nonce, "Nonce too high");
        // @todo
        /// Optimizational - Gas waste due to long string errors.
        /// Limit revert strings up to 3 words to keep it within 32 bytes
        /// or opt for custom errors and use bytes4 values.
        require(
            currency == 1,
            "Currency must be ETH, if you want to make ERC20 withdraw use withdrawERC function"
        );
        // @todo
        /// Optimizational
        /// Use assembly method `selfbalance()` instead of
        /// `address(this).balance` for gas savings.
        require(
            address(this).balance >= amount,
            "Contract doesn't have enough funds to withdraw"
        );

        _validate(
            amount,
            nonce,
            currency,
            txid,
            receiver,
            signature
        );
        uint256 amountWBTC = _validateAndGetWithdrawalLimit(
            currency,
            amount
        );
        dailyWithdrawalLimitInWBTCBaseUnits -= amountWBTC;
        emit Withdraw(receiver, amount);
        lastWithdrawalCommitedTimestamp = block.timestamp;
        // @audit Cross reentrancy (Medium)
        /// This function makes an external call to `msg.sender`; this account can
        /// be a contract that may inject malicious payload through receive logic
        /// seeing to perform reentrancy. In thesis, as long as the `ecrecovered`
        /// message can't be replayed, it is unlikely that one could pull of this attack.
        /// Nonetheless, there is still uncertainty about the possibility of using
        /// inline assembly injection to bypass the validation via jumpdest calls
        /// and drain the contract balance.

        (bool success, ) = payable(receiver).call{
            value: amount
        }("");
        require(success, "Error making a transaction");
    }

    //userid

    /// @notice Method that enables an external actor to deposit WBTC or USDC into the contract.
    /// @dev Allowances/Approvals must be set in the token's contract for the transfer to go through.
    ///
    /// @param amount The amount of an token wished to be deposited into the contract. Paremeter
    /// emitted by the `ERC20Depoisted` event.
    ///
    /// @param tokenAddress The address of the token that is intended to be deposited into the contract.
    /// This value gets paired with the provided currency value in order to check that the path resolved
    /// by the `validateCurrency` function is valid. Parameter emitted by the `ERC20Depoisted` event.
    ///
    /// @param currency The selected currency uint8 value (i.e., 0 := WBTC, 2 := USDC) to be path resolved
    /// with its `tokenAddress` pairing by the `validateCurrency` function.
    ///
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0xb70f307c
    function depositERC(
        uint256 amount,
        address tokenAddress,
        uint8 currency,
        // @todo
        /// Optimizational - Useless paremeter (i.e., `userId`).
        /// Remove or use in event emission  in order to ease frontend fetching.
        uint256 userid
    ) external requireNotPaused nonReentrant {
        validateCurrency(tokenAddress, currency);
        IERC20 token = IERC20(tokenAddress);
        //amount not 10
        token.safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        emit ERC20Deposited(msg.sender, amount, tokenAddress);
    }

    //nonReentrant

    /// @notice WBTC or USDC withdraw method.
    /// @dev Frontend should estimate the `nonceState` through event emission of both
    /// `withdraw` and `withdrawERC` functions; since the contract does not provide
    /// a way to fetch such state variable.
    ///
    /// @dev Both `withdraw` and `withdrawERC` use the same nonce whilst validating messages
    /// and checking against storage within control flow.
    ///
    /// @param amount The amount of the selected ERC20 token wished to be withdrawn
    /// from this contract. This parameter will be checked against the contract's
    /// ERC20 balance within the control flow; provided as part of the signed message
    /// to be validated by the `_validate` private function; converted to the scalar of
    /// WBTC (1e8) if the currency equals 2 (USDC); then checked against the daily withdrawal
    /// limit by the `_validateAndGetWithdrawalLimit` internal function. In case of passing all
    /// requirements, this parameter's value is then transfered to the receiver and logged in the
    /// `ERC20Withdraw` event.
    ///
    /// @param nonce The nonce value used as a counter to prevent signature replay attacks;
    /// must be always less than current `nonceState` value +1. This value will return true
    /// if provided as a key entry of the nonces mapping once this function call is succeeded.
    ///
    /// @param tokenAddress The address of the token that is intended to be deposited into the
    /// contract. This value gets paired with the provided currency value in order to check that
    /// the path resolved by the `validateCurrency` function is valid. Parameter emitted by
    /// the `ERC20Withdraw` event.
    ///
    /// @param currency The selected currency uint8 value (i.e., 0 := WBTC, 2 := USDC) to be
    /// path resolved with its `tokenAddress` pairing by the `validateCurrency` function. The
    /// value gets provided as part of the signed message to be validated; then, the parameter
    /// serves as path selector for the `_validateAndGetWithdrawalLimit` function.
    ///
    /// @param receiver The address entitled to receive the withdrawn ERC20 balance. This
    /// parameter is provided as part of the signed message to be validated by `_validate` fx;
    /// then provided as the `to` parameter of the token's `safeTransfer` method.
    /// Parameter emitted in event `ERC20Withdraw`.
    ///
    /// @param txid The `bytes32` transaction identifier only used for signed message validation.
    /// @param signature The offchain generated signature used in `ecrecover`. Constituted by
    /// the concatenation of the splitted signature (i.e., r,s,v).
    ///
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0xc1678cd8
    function withdrawERC(
        uint256 amount,
        uint256 nonce,
        address tokenAddress,
        uint8 currency,
        address receiver,
        bytes32 txid,
        bytes memory signature
    ) external requireNotPaused {
        nonceState++;
        require(nonceState > nonce, "Nonce too high");
        validateCurrency(tokenAddress, currency);
        IERC20 token = IERC20(tokenAddress);
        // @todo
        /// Optimizational - Gas waste due to long string errors.
        /// Limit revert strings up to 3 words to keep it within 32 bytes
        /// or opt for custom errors and use bytes4 values.
        require(
            token.balanceOf(address(this)) >= amount,
            "Contract doesn't have enough funds to withdraw"
        );
        _validate(
            amount,
            nonce,
            currency,
            txid,
            receiver,
            signature
        );
        uint256 amountWBTC = _validateAndGetWithdrawalLimit(
            currency,
            amount
        );
        token.safeTransfer(receiver, amount);
        // @audit - Reentrancy (Medium)
        /// State variable written after external call.
        /// Use the Checks-Effects-Interactions pattern for correctness.

        /// @todo Consider performing COP (Condition-Orientated Programming) and
        /// CEI (Checks Effects Interactions) best pratices. Videlicet, condition
        /// check control flow first, then storage updating logic and external calls for last.
        /// Consider using a nonReentrant modifier in case of doubt about the vulnerability persistance.
        dailyWithdrawalLimitInWBTCBaseUnits -= amountWBTC;
        emit ERC20Withdraw(receiver, amount, tokenAddress);
        lastWithdrawalCommitedTimestamp = block.timestamp;
    }

    //restricted

    /// @notice Public contract's balance getter.
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0x12065fe0
    function getBalance() public view returns (uint256) {
        // @todo - Optimizational
        /// Useless function since this can already be known natively through provider request.
        /// Consider removing it or turning it into an assembly selfbalance() getter (so it can
        /// be used within other functions' control flow).
        return address(this).balance;
    }

    /// @notice Public getter for the private `pubkeyaddress` state variable.
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0x4ad02ef1
    function getPubKey() public view returns (address) {
        return pubkeyaddress;
    }

    //external

    /// @notice Owner restricted function that pauses all functions restricted by
    /// the `requireNotPaused` modifier (`deposit`, `withdraw`, `deposit` and `depositERC`).
    /// @dev `pausedTimestamp` will be updated by the current block.timestamp of this function call.
    /// @dev `pausedFor` will be updated by the provided value of parameter `amountSeconds` as long as
    /// 0 is not passed in as its value.
    ///
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0x136439dd
    function pause(
        uint256 amountSeconds
    ) external restricted {
        pausedTimestamp = block.timestamp;
        require(amountSeconds <= 7 days);

        if (amountSeconds != 0) {
            pausedFor = amountSeconds;
        }
    }

    /// @notice Owner restricted function that unpauses/resumes all functions restricted by
    /// the `requireNotPaused` modifier (`deposit`, `withdraw`, `deposit` and `depositERC`).
    /// @dev `pausedTimestamp` will be reset to 0 via this function call.
    ///
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0x046f7da2
    function resume() public restricted {
        pausedTimestamp = 0;
    }

    //This can be called from off-chain like this :
    // function resetWithdrawal(amount) {
    //new web3.eth.Contract.methods.resetWithdrawalLimit(amount).send();
    //};

    //setInterval( function() { resetWithdrawal(1000000000000000000); }, 5001000 * 60 * 60 * 24 );
    // this will run every 24 hours
    // or we can use SC automation service like Gelato (https://www.gelato.network) and schedule function calls

    /// @notice External method callable each 24 hours that resets the daily withdrawal limit to its initial value.
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0x9c9de1b7
    function resetWithdrawalLimit() external {
        require(
            lastWithdrawalLimitTimestamp + 24 hours <
                block.timestamp
        );
        dailyWithdrawalLimitInWBTCBaseUnits = dailyWithdrawalLimitInWBTCBaseUnitsInit;
        lastWithdrawalLimitTimestamp = block.timestamp;
    }

    /// @notice Internal auxiliary method that asserts a hardcoded limit for an wished 
    /// `amount`, returning the amount to be decreased from the daily withdrawal limit.
    /// @dev Referenced in `withdrawERC` and `withdraw` functions.
    /// @dev Function sighash := 0xf3c81b6d
    function _validateAndGetWithdrawalLimit(
        uint8 currency,
        uint256 amount
    ) internal view returns (uint256) {
        //WBTC
        if (currency == 0) {
            // uint256 oneWBTC = 10**8;  standard daily withdrawal limit = 1 BTC = 10**8
            require(
                dailyWithdrawalLimitInWBTCBaseUnits >= amount,
                "Error withdrawal limit"
            );
            return amount;
        }
        // @todo - Turn these convertion rates into mutable state variables.
        /// It is worth noting that in case of this convertion rate (1:10:10000) getting
        /// disrupted largely, there is no mechanism to update the conversion rate values.
        /// If it is intended to keep them as constant values, declaring them as such instead
        /// of casting them to memory would represent a gas saving. If not, consider turning
        /// them into mutable storage state vars accessable through auth restricted functions.
        //ETH
        else if (currency == 1) {
            uint256 ethLimit = 10 ** 11; // 10 ETH    * 10**18 / 10**8
            uint256 limitInWBTCBaseUnits = (amount) /
                ethLimit;
            require(
                dailyWithdrawalLimitInWBTCBaseUnits >=
                    limitInWBTCBaseUnits,
                "Error withdrawal limit"
            );
            return limitInWBTCBaseUnits;
        }
        //USDC
        else if (currency == 2) {
            //1 USDC in base units = 10^6
            uint256 usdcLimit = 10 ** 2; // 10000 USDC 10**4   * 10**6 / 10**8
            uint256 limitInWBTCBaseUnits = (amount) /
                usdcLimit;

            require(
                dailyWithdrawalLimitInWBTCBaseUnits >=
                    limitInWBTCBaseUnits,
                "Error withdrawal limit"
            );
            return limitInWBTCBaseUnits;
        } else {
            revert("Incorrect currency value");
        }
    }

    /// @notice An auxiliar internal method that hashes the passed in parameters as a bytes32 message.
    /// @dev This function is referenced by the private `_validate` function.
    /// @dev Function sighash := 0xf3b85e21
    function toHashMessage(
        uint256 amount,
        uint256 nonce,
        uint8 currency,
        bytes32 txid,
        address receiver
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    amount,
                    nonce,
                    currency,
                    txid,
                    receiver
                )
            );
    }

    /// @notice Owner restricted method that updates the `pubKey` state variable.
    /// @dev Control flow ensures that the `publicKey` state variable will not be
    /// updated for a minimum of 180 days following the last time `withdraw` or
    /// `withdrawERC` were called.
    ///
    /// @dev Function reverts if the bytes default value is passed in (i.e., 0x00).
    ///
    /// @dev This function is not referenced in any other methods.
    /// @dev Function sighash := 0x8b93f545
    function changePubKey(
        bytes memory pubKey
    ) external restricted {
        require(
            lastWithdrawalCommitedTimestamp + 180 days <=
                block.timestamp
        );
        /// @audit
        /// Contract's interaction flow disruption (Severe)
        /// This function is rendered useless, since updating the storage
        /// value for `publicKey` does not affect the state var used to be
        /// checked against the recovered signer of a message (i.e., `pubkeyaddress`).
        /// This implies that, in this implementation, a compromissed signer cannot be
        /// replaced by the owner.

        // @todo
        /// Optimizational - Gas waste due to long string errors.
        /// Limit revert strings up to 3 words to keep it within 32 bytes
        /// or opt for custom errors and use bytes4 values.
        /// @todo
        /// Optimizational - Remove this check
        /// This check is useless since tx will go through even with zero Hash
        /// passed as the `pubKey` parameter.
        require(
            address(uint160(uint256(keccak256(pubKey)))) !=
                address(0),
            "Validation: Invalid recovered address"
        );
        publicKey = pubKey;
    }

    /// @notice Private view control flow auxiliar logic that checks if the resolved
    /// `tokenAddress` and `currency` pairing is a valid path.
    /// @dev Referenced in `depositERC` and `withdrawERC` functions.
    /// @dev Function sighash := 0x05b766a4
    function validateCurrency(
        address tokenAddress,
        uint8 currency
    ) private view {
        require(currency == 0 || currency == 2);

        if (currency == 0) {
            require(tokenAddress == WBTCAddress);
        } else if (currency == 2) {
            require(tokenAddress == USDCAddress);
        }
    }

    /// @dev Modifier that restricts the msg.sender of a call to the owner of this contract.
    /// @dev Referenced in `changePubKey`, `pause` and `resume` functions.
    modifier restricted() {
        require(msg.sender == owner);
        _;
    }

    /// @dev Modifier that prevents functions to be called if contract state is paused.
    /// @dev Referenced in `deposit`, `withdraw`, `depositERC`, and `withdrawERC` functions.
    modifier requireNotPaused() {
        require(
            pausedTimestamp + pausedFor < block.timestamp,
            "Contract is paused"
        );
        _;
    }
}
