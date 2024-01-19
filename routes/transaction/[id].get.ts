import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { ethers } from 'ethers';


export default eventHandler(async (event) => {
  const address = event.context.params.id;
  const provider = ethers.getDefaultProvider("homestead");

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer})

  const safeSdk: Safe = await (Safe as any).default.create({
    safeAddress: address,
    ethAdapter: ethAdapter,
  })

  console.log(await safeSdk.getOwners())

  return { nitro: "Transaction Builder!", address };
});
