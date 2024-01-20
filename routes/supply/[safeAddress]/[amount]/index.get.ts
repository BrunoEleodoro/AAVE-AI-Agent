import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  SafeTransaction,
} from "@safe-global/safe-core-sdk-types";
import { ethers, parseUnits } from "ethers";
import SafeApiKit from "@safe-global/api-kit";
import GHOAbi from "../../../../abis/GHOToken.json";
import PoolABI from "../../../../abis/Pool.json";
import WETHABI from "../../../../abis/WETH.json";
import { getRouterParam } from "h3";
import { customOptions } from "../../../constants";

export default eventHandler(async (event) => {
  const addressURL = event.context.params.safeAddress;
  const address = addressURL.includes(":") ? addressURL.split(":")[1] : addressURL;
  const amount = event.context.params.amount;
  const amountBignumber = parseUnits(amount, 18);

  console.log(event.context.params);
  const PoolAddress = "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2";
  const WethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const provider = ethers.getDefaultProvider("homestead");

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
  const WethContract = new ethers.Contract(WethAddress, WETHABI, signer);
  const PoolContract = new ethers.Contract(PoolAddress, PoolABI, signer);

  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });
  const safeSdk: Safe = await (Safe as any).default.create({
    safeAddress: address,
    ethAdapter: ethAdapter,
  });

  const allowance = await WethContract.allowance(address, PoolAddress);
  console.log(allowance.toString());

  let transactions: MetaTransactionData[] = [];

  if (ethers.toBigInt(allowance) < parseUnits(amount, 18)) {
    const txData = await WethContract.approve.populateTransaction(
      PoolAddress,
      amountBignumber
    );
    const safeTransactionData: MetaTransactionData = {
      to: WethAddress,
      value: "0",
      data: txData.data,
    };
    transactions.push(safeTransactionData);
  }

  // supply
  const txData = await PoolContract.supply.populateTransaction(
    WethAddress,
    amountBignumber,
    address,
    0
  );
  const safeTransactionData: MetaTransactionData = {
    to: PoolAddress,
    value: "0",
    data: txData.data,
  };
  transactions.push(safeTransactionData);

  const safeTransaction = await safeSdk.createTransaction({
    transactions: transactions,
    options: customOptions,
  });

  // or using a custom service
  const safeApiKit = new (SafeApiKit as any).default({
    chainId: 1 as any, // set the correct chainId
  });

  const senderAddress = await signer.getAddress();
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
  const signature = await safeSdk.signTransactionHash(safeTxHash);

  await safeApiKit.proposeTransaction({
    safeAddress: await safeSdk.getAddress(),
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress,
    senderSignature: signature.data,
  });

  return {
    res: "Transaction proposed sucessfully! now just click on the link to approve the transaction!",
    link: "https://app.safe.global/transactions/queue?safe=eth:" + address,
  };
});
