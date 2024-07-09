import { PublicKey } from "@solana/web3.js";

const isMainnet = false;
export const SWRD_TOKEN_MINT = new PublicKey(
  isMainnet
    ? "3q9VB2wXfhV97cXMgWzz8NHFanXhqmf6gRdZ8UV5dsR8"
    : "3q9VB2wXfhV97cXMgWzz8NHFanXhqmf6gRdZ8UV5dsR8"
);
export const CREATE_TOKEN_FLAG = true; // true -> create new token, false -> use above token

export const IMG_NAME = "MMTN.jpg";
export const IMG_PATH = `assets/${IMG_NAME}`;
export const TOKEN_NAME = "TestMMTN";
export const TOKEN_SYMBOL = "TMMTN";
export const TOKEN_DESCRIPTION =
  "It's just test MAGIC MITTENS token on dev net, so don't buy it";
export const TOKEM_DECIMAL = 9; // token decimal
export const MINT_AMOUNT = 3_000_000_000; // total supply

export const NETWORK = isMainnet ? "mainnet-beta" : "devnet";
export const MAINNET_BUNDLR: string = "https://node1.bundlr.network";
export const DEVNET_BUNDLR: string = "https://devnet.bundlr.network";
export const BUNDLR_ADDR = isMainnet ? MAINNET_BUNDLR : DEVNET_BUNDLR;
export const IS_TOKEN_2022 = false;

export const PRIVATE_KEY = "";
