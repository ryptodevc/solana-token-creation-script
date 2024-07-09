import {
    DataV2,
    createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

import {
    Connection,
    clusterApiUrl,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey,
    Cluster,
} from "@solana/web3.js";
import { setAuthority } from "@solana/spl-token";
import bs58 from "bs58";
  
import * as Constants from "./constants";
  
  let networkUrl = clusterApiUrl(Constants.NETWORK as Cluster);
  console.log(networkUrl);
  let connection = new Connection(networkUrl, "confirmed");
  
  const user = Keypair.fromSecretKey(bs58.decode(Constants.PRIVATE_KEY));
  const payer = user;
  const mintAuthority = user.publicKey;
  const updateAuthority = user.publicKey;
  
  let mintKey = new PublicKey("MA3xNvzDMU4ozKraytSjhSGYxNwEo5j9kJmLbXHfTdK");
  
  async function main() {
  
    // onchain metadata format
    // const tokenMetadata = {
    //   name: Constants.TOKEN_NAME,
    //   symbol: Constants.TOKEN_SYMBOL,
    //   uri: "https://arweave.net/JPDY6K_Cn-a_g23VicJe_Gv-u0tTP3AsI-Uff-3BM88",
    //   sellerFeeBasisPoints: 0,
    //   creators: null,
    //   collection: null,
    //   uses: null,
    // } as DataV2;
  
    // console.log("=============================");
    // console.log("CREATING TRANSACTION");
    // console.log("=============================");
    // // transaction to create metadata account  
  
    // // Make token immutable
    // const transaction = new Transaction().add(
    //     createUpdateMetadataAccountV2Instruction(
    //         {
    //             metadata: new PublicKey('3v8W1xFmr8m2tLGXbdiACRqdDTiRwnGqYHEBQ5AgKzPX'),
    //             updateAuthority: updateAuthority
    //         },
    //         {
    //             updateMetadataAccountArgsV2:{
    //             data: tokenMetadata,
    //             isMutable: false,
    //             updateAuthority: null,
    //             primarySaleHappened: null
    //             },
    //         }
    //     )
    // );
  
    // console.log(`IMMUTABLE TRANSACTİON : ${transaction}`);
    // console.log("=============================");
    // console.log("BEGIN SENDANDCONFIRMTRANSACTION");

    // // send transaction
    // const transactionSignature = await sendAndConfirmTransaction(
    //   connection,
    //   transaction,
    //   [payer]
    // );
  
    // console.log(
    //   `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    // );
    // console.log("PublicKey:", user.publicKey.toBase58());
  
    await setAuthority(
        connection,
        payer,
        mintKey,
        mintAuthority,
        0,
        null
    )
}
  
  main()
    .then(() => {
      console.log("Finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
  