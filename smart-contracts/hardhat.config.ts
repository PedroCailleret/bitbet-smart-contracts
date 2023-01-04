import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";

import "./tasks/accounts";
import "./tasks/deploy";

const dotenvConfigPath: string =
  process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const alchemyApiKey: string | undefined =
  process.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  throw new Error(
    "Please set your ALCHEMY_API_KEY in a .env file",
  );
}

const chainIds = {
  hardhat: 31337,
  mainnet: 1,
};

function getChainConfig(
  chain: keyof typeof chainIds,
): NetworkUserConfig {
  let jsonRpcUrl: string =
    "https://eth-mainnet.g.alchemy.com/v2/" + alchemyApiKey;
  return {
    chainId: chainIds[chain],
    gas: 1800000,
    url: jsonRpcUrl,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: "99999999999999999999999",
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
      forking: {
        url:
          "https://eth-mainnet.g.alchemy.com/v2/" +
          alchemyApiKey,
      },
      chainId: chainIds.hardhat,
    },
    mainnet: getChainConfig("mainnet"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.17",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
