import { personalSign } from "@metamask/eth-sig-util";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BytesLike } from "ethers";
import { ethers } from "hardhat";

import * as Consts from "../utils/constants";
import { PaymentErrors } from "../utils/errors";
import { PaymentEvents } from "../utils/events";

export function shouldBehaveLikePayment(): void {
  describe("Public Getters", async () => {
    it("should return contract balance", async function () {
      const providerBal1 =
        await this.payment.provider.getBalance(
          this.payment.address,
        );
      const bal1 = await this.payment.callStatic.getBalance();
      // we can't directly send eth due to no fallback/receive logic
      const fail = this.signers.admin.sendTransaction({
        to: this.payment.address,
        value: Consts.price,
      });
      await this.payment.deposit(Consts.magicVal, {
        value: Consts.price,
      });
      const providerBal2 =
        await this.payment.provider.getBalance(
          this.payment.address,
        );
      const bal2 = await this.payment.callStatic.getBalance();

      expect(bal1).to.be.ok;
      expect(bal2).to.be.ok;
      expect(providerBal1).to.eq(bal1);
      expect(bal1).to.eq(Consts.zero);
      expect(providerBal2).to.eq(bal2);
      expect(bal2).to.eq(Consts.price);
      await expect(fail).to.be.revertedWithoutReason;
    });
    it("should fetch public key address", async function () {
      const wallet = new ethers.Wallet(Consts.pk);
      const addr = await wallet.getAddress();
      const tx = await this.payment.callStatic.getPubKey();

      // console.log(await wallet.publicKey) --> uncompressed public key with first byte (i.e., 0x04) untrimmed.
      // console.log(wallet.getAddress()) --> address derived from public key ( i.e., address(uint160(uint256(keccak256(publicKey)))) )

      // https://ethereum.stackexchange.com/questions/101994/compute-address-of-public-key-string-in-solidity
      // https://github.com/ethers-io/ethers.js/issues/670

      expect(tx).to.be.ok.and.to.eq(addr);
    });
  });

  describe("Deposit ETH", async () => {
    it("should revert if contract is paused", async function () {
      await this.payment.pause(Consts.magicVal);
      const tx = this.payment.deposit("1", {
        value: Consts.price,
      });

      await expect(tx).to.be.revertedWith(
        PaymentErrors.PausedContract,
      );
    });
    it("should revert if userID is <= 0", async function () {
      const tx = this.payment.deposit("0", { value: 0 });

      expect(tx).to.be.revertedWith(
        PaymentErrors.InvalidUserID,
      );
    });
    it("should deposit ETH into the smart contract", async function () {
      const tx = await this.payment.deposit(Consts.magicVal, {
        value: Consts.price,
      });

      expect(tx).to.be.ok;
      expect(tx)
        .to.emit(this.payment, PaymentEvents.Deposited)
        .withArgs(this.signers.admin, Consts.price, 1);
      expect(tx).to.changeEtherBalances(
        [this.signers.admin, this.payment],
        [-Consts.price, Consts.price],
      );
    });
  });
  describe("Deposit ERC20", async () => {
    it("should revert if contract is paused", async function () {
      await this.payment.pause(Consts.magicVal);
      const fail = this.payment.depositERC(
        Consts.price,
        Consts.zeroAddr,
        Consts.zero,
        Consts.magicVal,
      );

      await expect(fail).to.be.revertedWith(
        PaymentErrors.PausedContract,
      );
    });
    it("should revert if provided currency is != 2 || != 0", async function () {
      const fail = this.payment.depositERC(
        Consts.price,
        Consts.wbtc,
        1,
        Consts.magicVal,
      );

      await expect(fail).to.be.revertedWithoutReason;
    });
    it("should revert if provided token isn't allowed by the contract", async function () {
      const fail = this.payment.depositERC(
        Consts.price,
        Consts.zeroAddr,
        0,
        Consts.magicVal,
      );

      await expect(fail).to.be.revertedWithoutReason;
    });
    it("should deposit ERC20 into the smart contract", async function () {
      await this.mockERC20.approve(
        this.payment.address,
        Consts.price,
      );

      const tx = await this.payment.depositERC(
        Consts.wbtcPrice,
        this.mockERC20.address,
        0,
        Consts.magicVal,
      );

      expect(tx).to.be.ok;
      expect(tx).to.changeTokenBalances(
        this.mockERC20,
        [this.signers.admin, this.payment],
        [-Consts.wbtcPrice, Consts.wbtcPrice],
      );
      expect(tx)
        .to.emit(this.payment, PaymentEvents.ERC20Deposited)
        .withArgs(
          this.signers.admin,
          Consts.wbtcPrice,
          this.mockERC20.address,
        );
    });
  });

  describe("Withdraw ETH", async () => {
    it("should revert if contract is paused", async function () {
      await this.payment.pause(Consts.magicVal);
      const fail = this.payment.withdraw(
        Consts.price,
        "1",
        this.signers.admin.address,
        "1",
        Consts.hashZero,
        [],
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.PausedContract,
      );
    });
    it("should revert if the nonce state is > than the provided nonce", async function () {
      const fail = this.payment.withdraw(
        Consts.price,
        "1",
        this.signers.admin.address,
        "1",
        Consts.hashZero,
        [],
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.NonceTooHigh,
      );
    });
    it("should revert if the currency provided is != 1", async function () {
      const fail = this.payment.withdraw(
        Consts.price,
        Consts.zero,
        this.signers.admin.address,
        Consts.zero,
        Consts.hashZero,
        [],
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.CurrencyMustBeETH,
      );
    });
    it("should revert if the contract doesn't have enough balance", async function () {
      const fail = this.payment.withdraw(
        Consts.price,
        Consts.zero,
        this.signers.admin.address,
        Consts.one,
        Consts.hashZero,
        [],
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.LowContractBalance,
      );
    });
    it("should revert if verification fails", async function () {
      await this.payment.deposit(Consts.magicVal, {
        value: Consts.price,
      });

      const fail = this.payment.withdraw(
        Consts.price,
        Consts.zero,
        this.signers.admin.address,
        Consts.one,
        Consts.hashZero,
        [],
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.VerificationFailed,
      );
    });
    it("should revert if recovered signer is != `pubkeyaddress`", async function () {
      await this.payment.deposit(Consts.magicVal, {
        value: Consts.price,
      });

      const preSignMsg = ethers.utils.arrayify(
        ethers.utils.solidityKeccak256(
          [
            "uint256",
            "uint256",
            "uint8",
            "bytes32",
            "address",
          ],
          [
            Consts.price,
            Consts.zero,
            Consts.one,
            Consts.hashZero,
            this.signers.admin.address,
          ],
        ),
      );
      const signedMsg = await this.signers.acc02.signMessage(
        preSignMsg,
      );

      const fail = this.payment.withdraw(
        Consts.price, // amount
        Consts.zero, // nonce
        this.signers.admin.address, // receiver
        Consts.one, // currency
        Consts.hashZero, // txid
        signedMsg, // signature
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.RecoveredAddressAndPublicKeyDiffer,
      );
    });
    it("should revert if the wished amount exceeds the daily withdrawal limit", async function () {
      const newPrice = ethers.utils.parseEther("100");
      await this.payment.deposit(Consts.magicVal, {
        value: newPrice,
      });

      const preSignMsg = ethers.utils.solidityKeccak256(
        ["uint256", "uint256", "uint8", "bytes32", "address"],
        [
          newPrice,
          Consts.zero,
          Consts.one,
          Consts.hashZero,
          this.signers.admin.address,
        ],
      );

      const pkBuffer: Buffer = Buffer.from(
        Consts.pk.toString().replace(/^0x+/, ""),
        "hex",
      );

      const signedMsg = personalSign({
        privateKey: pkBuffer,
        data: preSignMsg,
      });

      const fail = this.payment.withdraw(
        newPrice, // amount
        Consts.zero, // nonce
        this.signers.admin.address, // receiver
        Consts.one, // currency
        Consts.hashZero, // txid
        signedMsg, // signature
      );

      await expect(fail).to.be.revertedWith(
        PaymentErrors.ErrorWithdrawalLimit,
      );
    });
    it("should withdraw ETH from the smart contract", async function () {
      await this.payment.deposit(Consts.magicVal, {
        value: Consts.price,
      });

      const preSignMsg = ethers.utils.solidityKeccak256(
        ["uint256", "uint256", "uint8", "bytes32", "address"],
        [
          Consts.price,
          Consts.zero,
          Consts.one,
          Consts.hashZero,
          this.signers.admin.address,
        ],
      );
      const pkBuffer: Buffer = Buffer.from(
        Consts.pk.toString().replace(/^0x+/, ""),
        "hex",
      );
      const signedMsg = personalSign({
        privateKey: pkBuffer,
        data: preSignMsg,
      });

      const tx = await this.payment.withdraw(
        Consts.price, // amount
        Consts.zero, // nonce
        this.signers.admin.address, // receiver
        Consts.one, // currency
        Consts.hashZero, // txid
        signedMsg, // signature
      );

      expect(tx).to.be.ok;
      expect(tx).to.changeEtherBalances(
        [this.signers.admin.address, this.payment.address],
        [Consts.price, -Consts.price],
      );
      expect(tx)
        .to.emit(this.payment, PaymentEvents.Withdraw)
        .withArgs(this.signers.admin, Consts.price);
    });
  });
  describe("Withdraw ERC20", async () => {
    it("should revert if contract is paused", async function () {
      await this.payment.pause(Consts.magicVal);
      const fail = this.payment.withdrawERC(
        Consts.price,
        "0",
        Consts.wbtc,
        "0",
        this.signers.admin.address,
        Consts.hashZero,
        [],
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.PausedContract,
      );
    });
    it("should revert if the nonce state is > than the provided nonce", async function () {
      const fail = this.payment.withdrawERC(
        Consts.price,
        "1",
        Consts.wbtc,
        "0",
        this.signers.admin.address,
        Consts.hashZero,
        [],
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.NonceTooHigh,
      );
    });
    it("should revert if `currency` and `tokenAddress` resolve to invalid path", async function () {
      const fail1 = this.payment.withdrawERC(
        Consts.price,
        Consts.zero,
        this.payment.address,
        Consts.zero,
        this.signers.admin.address,
        Consts.hashZero,
        [],
      );
      const fail2 = this.payment.withdrawERC(
        Consts.price,
        Consts.zero,
        Consts.wbtc,
        Consts.one,
        this.signers.admin.address,
        Consts.hashZero,
        [],
      );

      await expect(fail1).to.be.revertedWithoutReason;
      await expect(fail2).to.be.revertedWithoutReason;
    });
    it("should revert if the contract doesn't have enough token balance", async function () {
      const fail = this.payment.withdrawERC(
        Consts.price,
        Consts.zero,
        Consts.wbtc,
        Consts.zero,
        this.signers.admin.address,
        Consts.hashZero,
        [],
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.LowContractBalance,
      );
    });
    it("should revert if verification fails", async function () {
      await this.mockERC20.approve(
        this.payment.address,
        Consts.wbtcPrice,
      );
      await this.payment.depositERC(
        Consts.wbtcPrice,
        this.mockERC20.address,
        0,
        Consts.magicVal,
      );
      const fail = this.payment.withdrawERC(
        Consts.wbtcPrice,
        Consts.zero,
        Consts.wbtc,
        Consts.zero,
        this.signers.admin.address,
        Consts.hashZero,
        [],
      );

      await expect(fail).to.be.revertedWith(
        PaymentErrors.VerificationFailed,
      );
    });
    it("should revert if recovered signer is != `pubkeyaddress`", async function () {
      await this.mockERC20.approve(
        this.payment.address,
        Consts.wbtcPrice,
      );
      await this.payment.depositERC(
        Consts.wbtcPrice,
        this.mockERC20.address,
        0,
        Consts.magicVal,
      );

      const preSignMsg = ethers.utils.arrayify(
        ethers.utils.solidityKeccak256(
          [
            "uint256",
            "uint256",
            "uint8",
            "bytes32",
            "address",
          ],
          [
            Consts.wbtcPrice,
            Consts.zero,
            Consts.zero,
            Consts.hashZero,
            this.signers.admin.address,
          ],
        ),
      );
      const signedMsg = await this.signers.acc02.signMessage(
        preSignMsg,
      );

      const fail = this.payment.withdrawERC(
        Consts.wbtcPrice, // amount
        Consts.zero, // nonce
        Consts.wbtc, // tokenAddress
        Consts.zero, // currency
        this.signers.admin.address, // receiver
        Consts.hashZero, // txid
        signedMsg, // signature
      );
      await expect(fail).to.be.revertedWith(
        PaymentErrors.RecoveredAddressAndPublicKeyDiffer,
      );
    });
    it("should revert if the wished amount exceeds the daily withdrawal limit", async function () {
      const newPrice = Consts.wbtcPrice.mul(Consts.two);
      await this.mockERC20.approve(
        this.payment.address,
        newPrice,
      );
      await this.payment.depositERC(
        newPrice,
        this.mockERC20.address,
        0,
        Consts.magicVal,
      );

      const preSignMsg = ethers.utils.arrayify(
        ethers.utils.solidityKeccak256(
          [
            "uint256",
            "uint256",
            "uint8",
            "bytes32",
            "address",
          ],
          [
            newPrice,
            Consts.zero,
            Consts.zero,
            Consts.hashZero,
            this.signers.admin.address,
          ],
        ),
      );
      const pkBuffer: Buffer = Buffer.from(
        Consts.pk.toString().replace(/^0x+/, ""),
        "hex",
      );
      const signedMsg = personalSign({
        privateKey: pkBuffer,
        data: preSignMsg,
      });

      const fail = this.payment.withdrawERC(
        newPrice, // amount
        Consts.zero, // nonce
        Consts.wbtc, // tokenAddress
        Consts.zero, // currency
        this.signers.admin.address, // receiver
        Consts.hashZero, // txid
        signedMsg, // signature
      );

      await expect(fail).to.be.revertedWith(
        PaymentErrors.ErrorWithdrawalLimit,
      );
    });
    it("should withdraw ERC20 from the smart contract", async function () {
      await this.mockERC20.approve(
        this.payment.address,
        Consts.wbtcPrice,
      );
      await this.payment.depositERC(
        Consts.wbtcPrice,
        this.mockERC20.address,
        0,
        Consts.magicVal,
      );

      const preSignMsg = ethers.utils.solidityKeccak256(
        [
          "uint256", // amount
          "uint256", // nonce
          "uint8", // currency
          "bytes32", // txid
          "address", // receiver
        ],
        [
          Consts.wbtcPrice,
          Consts.zero,
          Consts.zero,
          Consts.hashZero,
          this.signers.admin.address,
        ],
      );
      const pkBuffer: Buffer = Buffer.from(
        Consts.pk.toString().replace(/^0x+/, ""),
        "hex",
      );
      const signedMsg = personalSign({
        privateKey: pkBuffer,
        data: preSignMsg,
      });

      const tx = await this.payment.withdrawERC(
        Consts.wbtcPrice, // amount
        Consts.zero, // nonce
        Consts.wbtc, // tokenAddress
        Consts.zero, // currency
        this.signers.admin.address, // receiver
        Consts.hashZero, // txid
        signedMsg, // signature
      );

      expect(tx).to.be.ok;
      expect(tx).to.changeTokenBalances(
        this.mockERC20,
        [this.signers.admin.address, this.payment.address],
        [Consts.wbtcPrice, -Consts.wbtcPrice],
      );
      expect(tx)
        .to.emit(this.payment, PaymentEvents.ERC20Withdraw)
        .withArgs(
          this.signers.admin,
          Consts.wbtcPrice,
          Consts.wbtc,
        );
    });
  });
  describe("Restricted Functions", async () => {
    it("should pause/unpause the contract", async function () {
      // revert if caller != owner
      const fail1 = this.payment
        .connect(this.signers.acc02)
        .pause(Consts.magicVal);
      // revert if amountSeconds is gt 7 days
      const fail2 = this.payment.pause(
        ethers.BigNumber.from("691200"),
      );
      // should pause
      const tx = await this.payment.pause(Consts.magicVal);
      // revert if caller != owner
      const fail3 = this.payment
        .connect(this.signers.acc01)
        .resume();
      // should unpause/resume
      const pause = this.payment.resume();

      await expect(fail1).to.be.revertedWithoutReason;
      await expect(fail2).to.be.revertedWithoutReason;
      expect(tx).to.be.ok;
      await expect(fail3).to.be.revertedWithoutReason;
      expect(await pause).to.be.ok;
    });
    it("should update `publicKey` state variable", async function () {
      const uncNewPubKey =
        ethers.Wallet.createRandom().publicKey;
      const newPubKey: BytesLike = ethers.utils.arrayify(
        "0x" + uncNewPubKey.slice(4),
      );

      // revert if caller != owner
      const fail1 = this.payment
        .connect(this.signers.acc01)
        .changePubKey(Consts.hashZero);
      // revert if lt 180 days since last withdrawal
      await this.payment.deposit(Consts.magicVal, {
        value: Consts.price,
      });

      const preSignMsg = ethers.utils.solidityKeccak256(
        ["uint256", "uint256", "uint8", "bytes32", "address"],
        [
          Consts.price,
          Consts.zero,
          Consts.one,
          Consts.hashZero,
          this.signers.admin.address,
        ],
      );
      const pkBuffer: Buffer = Buffer.from(
        Consts.pk.toString().replace(/^0x+/, ""),
        "hex",
      );
      const signedMsg = personalSign({
        privateKey: pkBuffer,
        data: preSignMsg,
      });

      const withd = await this.payment.withdraw(
        Consts.price, // amount
        Consts.zero, // nonce
        this.signers.admin.address, // receiver
        Consts.one, // currency
        Consts.hashZero, // txid
        signedMsg, // signature
      );

      const fail2 = this.payment.changePubKey(newPubKey);

      await helpers.time.increase(180 * 86401);

      // Broken check: call does not revert even with zero provided as the pubKey parameter!
      const shouldvefailed = await this.payment.changePubKey(
        Consts.hashZero,
      );
      const tx = await this.payment.changePubKey(newPubKey);

      await expect(fail1).to.be.revertedWithoutReason;
      await expect(fail2).to.be.revertedWithoutReason;
      // Should've reverted with PaymentErrors.InvalidRecoveredAddress
      await expect(shouldvefailed).to.be.ok;
      expect(tx).to.be.ok;
    });
  });
}
