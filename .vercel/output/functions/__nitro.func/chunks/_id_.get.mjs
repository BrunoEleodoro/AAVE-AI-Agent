import { e as eventHandler } from './nitro/vercel.mjs';
import { ethers, formatEther } from 'ethers';
import { fetchQuery, init } from '@airstack/node';
import axios from 'axios';
import { config } from 'dotenv';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';

config();
init(process.env.AIRSTACK_API_KEY);
const _id__get = eventHandler(async (event) => {
  const address = event.context.params.id;
  const provider = ethers.getDefaultProvider("homestead");
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
`;
  const { data: { ethereum: { ETHUSD } } } = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
  const balance = await provider.getBalance(address);
  const { data, error } = await fetchQuery(query, {});
  const filteredAAVETokens = data.Polygon.TokenBalance.filter((token) => token.token.name.includes("Aave"));
  return { balance: formatEther(balance), filteredAAVETokens, res: "get the ETHUSD and multiply by the WETH and balance the user has to show it in dollars", ETHUSD, address, error };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
