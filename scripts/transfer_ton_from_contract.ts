const TonWeb = require("tonweb");
const nacl = require("tweetnacl");
const TonMnemonic = require("tonweb-mnemonic");
import {
  TonClient,
  beginCell,
  Address,
} from "@ton/ton";
import { sign } from "@ton/crypto";

const mnemonic = [
  "clutch",
  "type",
  "water",
  "flower",
  "enlist",
  "trip",
  "pluck",
  "wife",
  "half",
  "found",
  "tissue",
  "false",
  "refuse",
  "wrong",
  "method",
  "actor",
  "interest",
  "dice",
  "select",
  "profit",
  "scrub",
  "harsh",
  "ginger",
  "sheriff",
];


const ApiKey = ""
const ContractAddress = "EQBdPwWd0zMbosW4pkTI5Txufhi5r6dj0hZhqqBVTOdyt5KJ"
const WalletAddress = "UQCwlRVm0JTh6OY1o6-c4SS3LytgqRMU91U9rztcKMee_mmE"
const TONCount = 0.1

async function main() {
  const client = new TonClient({
    endpoint: "https://ton.blockpi.network/v1/rpc/c5a86af8670168fb8ebec3b3a2b00284cedcb592/jsonRPC"
  });

  // DOUBLE CHECK IT
  let seqno = 123;
  let subwallet_id = 699290;
  const seed = await TonMnemonic.mnemonicToSeed(mnemonic);
  const keyPair = await nacl.sign.keyPair.fromSeed(seed.slice(0, 32));

  const msgBody2 = beginCell()
    .storeUint(0xf8a7ea5, 32)
    .storeUint(0, 64)
    .storeCoins(391203 * 10 ** 9)
    .storeAddress(
      Address.parse(WalletAddress)
    )
    .storeAddress(
      Address.parse(ContractAddress)
    )
    .storeUint(0, 1)
    .storeCoins(100000000)
    .storeUint(0, 1);

    console.log("1111\n");

  const msg = beginCell()
    .storeUint(0x18, 6)
    .storeAddress(
      Address.parse(WalletAddress)
    )
    .storeCoins(TONCount * 10 ** 9)
    .storeUint(0, 1 + 4 + 4 + 64 + 32 + 1)
    .storeUint(1, 1)
    .storeRef(msgBody2);

    console.log("2222\n");

  let toSign = beginCell()
    .storeUint(subwallet_id, 32) // subwallet_id | We consider this further
    .storeUint(Math.floor(Date.now() / 1e3) + 60, 32) // Message expiration time, +60 = 1 minute
    .storeUint(seqno, 32) // store seqno
    .storeUint(0, 8) // store mode of our internal message
    .storeUint(1, 8)
    .storeRef(msg); // store our internalMessage as a reference


  console.log("3333\n");
  let signature = sign(toSign.endCell().hash(), keyPair.secretKey); // get the hash of our message to wallet smart contract and sign it to get signature
  console.log("4444\n");


  let body = beginCell()
    .storeBuffer(signature) // store signature
    .storeBuilder(toSign) // store our message
    .endCell();

    console.log("5555\n");

  let externalMessage = beginCell()
    .storeUint(0b10, 2) // 0b10 -> 10 in binary
    .storeUint(0, 2) // src -> addr_none
    .storeAddress(
      Address.parse(ContractAddress)
    ) // Destination address
    .storeCoins(0) // Import Fee
    .storeBit(0) // No State Init
    .storeBit(1) // We store Message Body as a reference
    .storeRef(body) // Store Message Body as a reference
    .endCell();

    console.log("666\n");
  console.log(externalMessage.toBoc().toString("base64"));

  client.sendFile(externalMessage.toBoc());
}

main();
