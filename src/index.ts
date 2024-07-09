import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
  PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import * as fs from "fs";

import {
  Connection,
  SystemProgram,
  clusterApiUrl,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  Cluster,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  MINT_SIZE,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferInstruction,
  createAccount,
  setAuthority,
  updateTokenMetadata,
} from "@solana/spl-token";
import bs58 from "bs58";
import axios from "axios";
import https from "https";

import * as Constants from "./constants";
import { constants } from "fs/promises";

let networkUrl = clusterApiUrl(Constants.NETWORK as Cluster);
console.log(networkUrl);
let connection = new Connection(networkUrl, "confirmed");

const user = Keypair.fromSecretKey(bs58.decode(Constants.PRIVATE_KEY));
const payer = user;
const mintAuthority = user.publicKey;
const freezeAuthority = user.publicKey;
const updateAuthority = user.publicKey;
// const owner = new PublicKey('DotuVzhxgpiRjAmxSGky53XKWhzWXrQ35MMq7wu1ZrWc')
let mintKey: PublicKey;


const createToken = async () => {
  let mintKeypair = Keypair.generate();
  
  while(1) {
    mintKeypair = Keypair.generate();
    mintKey = mintKeypair.publicKey;

    if(mintKey.toString().indexOf("MMTN") == 0) {
      break
    }
    
  }
  console.log('mintKey', mintKey.toString())
  const mintAmount = Constants.MINT_AMOUNT * Math.pow(10, Constants.TOKEM_DECIMAL);
  console.log("log->mintAmount", mintAmount, BigInt(mintAmount))
  // return false
  // let contract_wallet = new PublicKey("8449bhHMLuxtG8K14XgQLK4eCHErbGMXDyynfPdX7doT");
  // Create Token
  // const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
  // console.log("<------------------- Waiting for transaction confirmation ------------------->")
  // await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });
  // console.log("<------------------- Tx confimred ------------------->")
  
  const requiredBalance = await getMinimumBalanceForRentExemptMint(connection);
  // const tokenATA1 = await getAssociatedTokenAddress(mintKey, user.publicKey);
  const tokenATA = await getAssociatedTokenAddress(mintKey, user.publicKey);
  // const tokenATAForContract_wallet = await getAssociatedTokenAddress(mintKey, contract_wallet);
  const latestBlockhash = await connection.getLatestBlockhash();
  const createTokenTx = new Transaction(latestBlockhash).add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKey,
      space: MINT_SIZE,
      lamports: requiredBalance,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKey,
      Constants.TOKEM_DECIMAL,
      mintAuthority,
      null,
      TOKEN_PROGRAM_ID
    ),
    createAssociatedTokenAccountInstruction(
      payer.publicKey,
      tokenATA,
      user.publicKey,
      mintKey
    ),
    createMintToInstruction(
      mintKey,
      tokenATA,
      mintAuthority,
      mintAmount
    ),
    // Transfer Minted token to Contract wallet
    // createAssociatedTokenAccountInstruction(
    //   payer.publicKey,
    //   tokenATAForContract_wallet,
    //   contract_wallet,
    //   mintKey
    // ),
    // createTransferInstruction(
    //   tokenATA,
    //   tokenATAForContract_wallet,
    //   user.publicKey,
    //   Constants.MINT_AMOUNT / 10 * 4 * Math.pow(10, Constants.TOKEM_DECIMAL)
    // )
  );
  // send transaction
  // const result = await sendAndConfirmTransaction(
  //   connection,
  //   createTokenTx,
  //   [payer, mintKeypair],
  //   undefined
  // );
  const result = await connection.sendTransaction(createTokenTx, [payer, mintKeypair])
  console.log(
    `Create Token : https://explorer.solana.com/tx/${result}?cluster=devnet`
  );
  console.log("Token address:", mintKey.toBase58());
};

async function main() {
  if (Constants.CREATE_TOKEN_FLAG) {
    await createToken();
  } else {
    mintKey = Constants.SWRD_TOKEN_MINT;
  }
  // metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: Constants.BUNDLR_ADDR,
        providerUrl: networkUrl,
        timeout: 60000,
      })
    );

  // file to buffer
  const buffer = fs.readFileSync(Constants.IMG_PATH);

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, Constants.IMG_NAME);

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: Constants.TOKEN_NAME,
    symbol: Constants.TOKEN_SYMBOL,
    description: Constants.TOKEN_DESCRIPTION,
    image: imageUri,
  });

  console.log("metadata uri:", uri);

  // get metadata account address
  // const metadataPDA = await findMetadataPda(tokenMint);
  const metadataPDA = metaplex.nfts().pdas().metadata({ mint: mintKey });
  // const [metadataPDA1] = await PublicKey.findProgramAddress(
  //   [Buffer.from("metadata"), PROGRAM_ID.toBuffer(), mintKey.toBuffer()],
  //   PROGRAM_ID
  // );
  console.log(`GET METADATA ACCOUNT ADDRESS is : ${metadataPDA}`);
  // console.log(`GET METADATA ACCOUNT ADDRESS is :: ${metadataPDA1}`);

  // onchain metadata format
  const tokenMetadata = {
    name: Constants.TOKEN_NAME,
    symbol: Constants.TOKEN_SYMBOL,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  console.log("=============================");
  console.log("CREATING TRANSACTION");
  console.log("=============================");
  // transaction to create metadata account

  const transaction = new Transaction().add(
    
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: mintKey,
        mintAuthority: mintAuthority,
        payer: payer.publicKey,
        updateAuthority: updateAuthority,
      },
      {
        createMetadataAccountArgsV3: {
          data: tokenMetadata,
          isMutable: false,
          collectionDetails: null,
        },
      }
      // Constants.IS_TOKEN_2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    )
  );


//Make token immutable
// const transaction = new Transaction().add(
//   createUpdateMetadataAccountV2Instruction(
//     {
//       metadata: new PublicKey('F5413RKdQo1u5t4kRXzLK5xQj39dtzNk76QqrQf2a6PP'),
//       updateAuthority: updateAuthority
//     },
//     {
//       updateMetadataAccountArgsV2:{
//         data: tokenMetadata,
//         isMutable: false,
//         updateAuthority: null,
//         primarySaleHappened: null
//       },
//     }
//   )
// );

  console.log(`METADATA TRANSACTİON : ${transaction}`);
  console.log("=============================");
  console.log("BEGIN SENDANDCONFIRMTRANSACTION");
  // send transaction
  const transactionSignature2 = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  // const transactionSignature2 = await connection.sendTransaction( transaction,[payer]);

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature2}?cluster=devnet`
  );
  console.log("PublicKey:", user.publicKey.toBase58());

// await setAuthority(
//     connection,
//     payer,
//     mintKey,
//     mintAuthority,
//     0,
//     null
// )
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
