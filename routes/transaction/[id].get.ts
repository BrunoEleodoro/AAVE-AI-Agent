import { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";

const provider = ethers.getDefaultProvider("homestead");

export default eventHandler((event) => {
  const address = event.context.params.id;
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  });
  
  return { nitro: "Transaction Builder!", address, ethAdapter };
});
