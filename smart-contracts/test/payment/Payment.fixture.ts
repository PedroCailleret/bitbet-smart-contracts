import {
  impersonateAccount,
  mine,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { BigNumber, BytesLike } from "ethers";
import { ethers } from "hardhat";

import type { ERC20 } from "../../types/@openzeppelin/contracts/token/ERC20/ERC20";
import type { Payment } from "../../types/contracts/PaymentsSolDec082022.sol/Payment";
import type { Payment__factory } from "../../types/factories/contracts/PaymentsSolDec082022.sol/Payment__factory";
import * as Consts from "../utils/constants";

// exported fx
export async function deployPaymentFixture(): Promise<{
  payment: Payment;
  mockERC20: ERC20;
}> {
  const signers: SignerWithAddress[] =
    await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];
  const dalyWithdrawalLimit: BigNumber =
    ethers.BigNumber.from("100000000");
  const publicKey: BytesLike = ethers.utils.arrayify(
    // uncompressed public key with first byte trimmed (0x04)
    Consts.uncTrim,
  );
  const Payment: Payment__factory = <Payment__factory>(
    await ethers.getContractFactory("Payment")
  );
  const payment: Payment = <Payment>(
    await Payment.connect(admin).deploy(
      dalyWithdrawalLimit,
      publicKey,
    )
  );
  await payment.deployed();

  const mockERC20: ERC20 = <ERC20>(
    await ethers.getContractAt("ERC20", Consts.wbtc)
  );
  const whaleBal = await mockERC20.callStatic.balanceOf(
    Consts.whaleAddr,
  );
  impersonateAccount(Consts.whaleAddr);
  const whaleSigner = await ethers.getSigner(
    Consts.whaleAddr,
  );
  setBalance(admin.address, Consts.fundAmount);
  setBalance(whaleSigner.address, Consts.fundAmount);
  await mine(1);

  await mockERC20
    .connect(whaleSigner)
    .transfer(admin.address, whaleBal);

  return { payment, mockERC20 };
}
