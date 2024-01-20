import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
  SafeSignature,
  SafeTransaction,
} from "@safe-global/safe-core-sdk-types";
import { ethers, parseUnits } from "ethers";
import SafeApiKit, { ProposeTransactionProps } from "@safe-global/api-kit";
import GHOAbi from "../../../../abis/GHOToken.json";
import PoolABI from "../../../../abis/Pool.json";
import WETHABI from "../../../../abis/WETH.json";
import { getRouterParam } from "h3";

export default eventHandler(async (event) => {
  const addressURL = event.context.params.safeAddress;
  const address = addressURL.includes(":")
    ? addressURL.split(":")[1]
    : addressURL;
  const amount = event.context.params.amount;
  const amountBignumber = parseUnits(amount, 18);

  console.log(event.context.params);
  const provider = ethers.getDefaultProvider("homestead");
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

  const PoolAddress = "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2";
  const PoolContract = new ethers.Contract(PoolAddress, PoolABI, signer);
  const GHOAddress = "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f";
  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });
  const safeSdk: Safe = await (Safe as any).default.create({
    safeAddress: address,
    ethAdapter: ethAdapter,
  });

  //   {
  //     "internalType": "address",
  //     "name": "asset",
  //     "type": "address"
  // },
  // {
  //     "internalType": "uint256",
  //     "name": "amount",
  //     "type": "uint256"
  // },
  // {
  //     "internalType": "uint256",
  //     "name": "interestRateMode",
  //     "type": "uint256"
  // },
  // {
  //     "internalType": "uint16",
  //     "name": "referralCode",
  //     "type": "uint16"
  // },
  // {
  //     "internalType": "address",
  //     "name": "onBehalfOf",
  //     "type": "address"
  // }
  // borrow
  const txData = await PoolContract.borrow.populateTransaction(
    GHOAddress,
    amountBignumber,
    2,
    ethers.parseEther("0").toString(),
    address
  );
  const safeTransactionData: MetaTransactionData = {
    to: PoolAddress,
    value: "0",
    data: txData.data,
  };
  const safeTransactionPrep = await safeSdk.createTransaction({
    transactions: [
      safeTransactionData,
      { to: PoolAddress, value: "0", data: "0x" },
    ],
  });
  
  // CRAZY WORKAROUND just because the API were failing
  // so I generate the transaction data and then I add it to the safeTransaction
  const safeTransaction: SafeTransaction = {
    ...safeTransactionPrep,
    data: {
      ...safeTransactionPrep.data,
      data: txData.data,
    },
  };

  // or using a custom service
  const safeApiKit = new (SafeApiKit as any).default({
    chainId: 1 as any, // set the correct chainId
  });

  const senderAddress = await signer.getAddress();
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
  const signature = await safeSdk.signTransactionHash(safeTxHash);
  const payload = {
    safeAddress: await safeSdk.getAddress(),
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress,
    senderSignature: signature.data,
  };
  await safeApiKit.proposeTransaction(payload);

  return {
    res: "Transaction proposed sucessfully! now just click on the link to approve the transaction!",
    link: "https://app.safe.global/transactions/queue?safe=eth:" + address,
  };
});
