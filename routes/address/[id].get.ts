import { ethers, formatEther } from "ethers";
import { fetchQuery, init } from "@airstack/node";
import axios from 'axios';
import { config } from "dotenv";
config();

init(process.env.AIRSTACK_API_KEY as string);

export default eventHandler(async (event) => {
  const address = event.context.params.id
  const provider = ethers.getDefaultProvider('homestead')
const query = `
query MyQuery {
  Polygon: TokenBalances(
    input: {filter: {owner: {_eq: "${address}"}}, blockchain: polygon}
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
  const { data: { ethereum: { ETHUSD } } } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
  const balance = await provider.getBalance(address);
  const { data, error } = await fetchQuery(query, {});
  const filteredAAVETokens = data.Polygon.TokenBalance.filter((token:any) => token.token.name.includes('Aave'))
  return { balance: formatEther(balance), filteredAAVETokens, res:'get the ETHUSD and multiply by the WETH and balance the user has to show it in dollars', ETHUSD , address, error}
})
