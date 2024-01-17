import { ethers, formatEther } from "ethers";
import { fetchQuery, init } from "@airstack/node";
import axios from 'axios';
import { config } from "dotenv";
import { getUserAccountData } from "./getUserAccountData";
import { networkProviders } from "./constants";
config();

init(process.env.AIRSTACK_API_KEY as string);

export default eventHandler(async (event) => {
  const address = event.context.params.id
  const network = event.context.params.network || 'homestead'
  const provider = ethers.getDefaultProvider(networkProviders[network.toLowerCase()])
const query = `
query MyQuery {
  Network: TokenBalances(
    input: {filter: {owner: {_eq: "${address}"}}, blockchain: ${network.toLowerCase()}}
  ) {
    TokenBalance {
      token {
        id
        name
        symbol
        totalSupply
        decimals
        contractMetaData {
          name
          description
          image
          externalLink
          sellerFeeBasisPoints
          feeRecipient
        }
      }
      amount
      formattedAmount
      lastUpdatedBlock
      lastUpdatedTimestamp
    }
  }
}
`
  //const { data: { ethereum: { usd: ETHUSD } } } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
  //const balance = await provider.getBalance(address);
  const accountData = await getUserAccountData(network,address);
  const { data, error } = await fetchQuery(query, {});
  if(data){
  const filteredAAVETokens = data.Network?.TokenBalance?.filter((token:any) => token.token.name.includes('Aave'))
  return { filteredAAVETokens, address, error, accountData}
  }else {
    return {error};
  }
})
