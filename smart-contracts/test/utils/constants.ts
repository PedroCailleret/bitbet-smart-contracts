import { BigNumber, BytesLike } from "ethers";
import { ethers } from "hardhat";

// exported consts
export const uncTrim: BytesLike =
  "0x9e6fa4ffa5bc48a53cf6a4b4039626c380abc19236fe1b58cec5e446902d270f32ea1ccb52652a7fa7a4f59664df1a7ba2eb6b8ef296370a958e61e8b2b3c3f6";
export const pk: BytesLike =
  "0x5669b8a9b6b392a3922f95734345f40605a9d2ea71b927fc6d8dd4da3d6869c9";

export const price: BigNumber = ethers.utils.parseEther("1");

export const wbtcPrice: BigNumber = ethers.utils.parseUnits(
  "1",
  8,
);

export const zero: BigNumber = ethers.constants.Zero;

export const one: BigNumber = ethers.constants.One;

export const two: BigNumber = ethers.constants.Two;

export const magicVal: string = "0x539";

export const zeroAddr: string = ethers.constants.AddressZero;

export const hashZero: string = ethers.constants.HashZero;

export const fundAmount: BigNumber = ethers.BigNumber.from(
  ethers.utils.parseEther("10000"),
);

export const whaleAddr: string =
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

export const wbtc: string =
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
