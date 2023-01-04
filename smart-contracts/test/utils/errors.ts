export enum PaymentErrors {
  InvalidRecoveredAddress = "Validation: Invalid recovered address",
  NonceExistent = "Nonce existent",
  VerificationFailed = "Validation : Verification failed",
  RecoveredAddressAndPublicKeyDiffer = "Validation : Recovered address does not match with the public key's address",
  InvalidUserID = "User ID must be greater than 0",
  NonceTooHigh = "Nonce too high",
  CurrencyMustBeETH = "Currency must be ETH, if you want to make ERC20 withdraw use withdrawERC function",
  LowContractBalance = "Contract doesn't have enough funds to withdraw",
  TransactionFailed = "Error making a transaction",
  ErrorWithdrawalLimit = "Error withdrawal limit",
  IncorrectCurrencyValue = "Incorrect currency value",
  PausedContract = "Contract is paused",
}
