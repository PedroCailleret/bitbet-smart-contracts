import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { Payment } from "../../types/contracts/PaymentsSolDec082022.sol/Payment";
import type { Payment__factory } from "../../types/factories/contracts/PaymentsSolDec082022.sol/Payment__factory";

// deploy via cli ( script | task | taskArgs | network ):
// yarn deploy
//    --daily-withdrawal-limit "{INSERT_VAL}"
//    --public-key "{INSERT_VAL}"
//    --network {INSERT_NETWORK_NAME}
task("deploy:Payment")
  .addParam("dailyWithdrawalLimit", "Insert uint256 value")
  .addParam("publicKey", "Insert bytes value")
  .setAction(async function (
    taskArguments: TaskArguments,
    { ethers },
  ) {
    const signers: SignerWithAddress[] =
      await ethers.getSigners();
    const Payment: Payment__factory = <Payment__factory>(
      await ethers.getContractFactory("Payment")
    );
    const payment: Payment = <Payment>(
      await Payment.connect(signers[0]).deploy(
        taskArguments.dailyWithdrawalLimit,
        taskArguments.publicKey,
      )
    );
    await payment.deployed();
    console.log(
      "✅ Deployed with account: %s",
      signers[0].address,
    );
    console.log(
      "✅ Payment deployed to: %s",
      payment.address,
    );
  });
