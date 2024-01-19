import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { ethers, parseUnits } from "ethers";
import SafeApiKit from "@safe-global/api-kit";
import GHOAbi from "../../../../abis/GHOToken.json";
import { getRouterParam } from "h3";

export default eventHandler(async (event) => {
  const address = event.context.params.safeAddress;
  const amount = event.context.params.amount;
  const destinationAddress = event.context.params.destinationAddress;


  console.log(event.context.params);

  const provider = ethers.getDefaultProvider("homestead");
  const addressFromENS = await provider.resolveName(destinationAddress);

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });

  const safeSdk: Safe = await (Safe as any).default.create({
    safeAddress: address,
    ethAdapter: ethAdapter,
  });

  const contractAddress = "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f";
  const GHOContract = new ethers.Contract(contractAddress, GHOAbi);
  const txData = await GHOContract.transfer.populateTransaction(
    addressFromENS,
    parseUnits(amount, 18)
  );
  console.log(txData);

  const safeTransactionData: MetaTransactionData = {
    to: contractAddress,
    value: "0",
    data: txData.data,
  };

  const safeTransaction = await safeSdk.createTransaction({
    transactions: [safeTransactionData],
  });

  // or using a custom service
  const safeApiKit = new SafeApiKit({
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
