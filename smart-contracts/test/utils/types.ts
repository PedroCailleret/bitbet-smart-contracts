import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { Payment } from "../../types/contracts/PaymentsSolDec082022.sol/Payment";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    payment: Payment;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  acc01: SignerWithAddress;
  acc02: SignerWithAddress;
}
