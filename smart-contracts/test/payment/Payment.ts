import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

// import { Payment } from "../../types/contracts/PaymentsSolDec082022.sol/Payment";
import type { Signers } from "../utils/types";
import { shouldBehaveLikePayment } from "./Payment.behavior";
import { deployPaymentFixture } from "./Payment.fixture";

// let payment: Payment;

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] =
      await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.acc01 = signers[1];
    this.signers.acc02 = signers[2];

    this.loadFixture = loadFixture;
  });

  describe("Payment", async function () {
    beforeEach(async function () {
      const { payment, mockERC20 } = await loadFixture(
        deployPaymentFixture,
      );
      this.payment = payment;
      this.mockERC20 = mockERC20;
    });

    shouldBehaveLikePayment();
  });
});
