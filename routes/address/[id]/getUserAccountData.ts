import abi from '../../../abis/Pool.json';
import { ethers, formatEther, formatUnits } from "ethers";
import { networkProviders } from './constants';

export async function getUserAccountData(network:string, address: string) {
  return new Promise((resolve, reject) => {

  const provider = ethers.getDefaultProvider(networkProviders[network.toLowerCase()])
const contractAddress = {
      'Polygon': '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      'ethereum': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      'mainnet': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      'homestead': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'
    };
var aaveContract = new ethers.Contract(contractAddress[network], abi, provider);

aaveContract.getUserAccountData(address).then(function(userAccountData) {
    resolve({
        totalCollateralBase: formatUnits(userAccountData.totalCollateralBase, 8),
        totalDebtBase: formatUnits(userAccountData.totalDebtBase, 8),
        availableBorrowsBase: formatUnits(userAccountData.availableBorrowsBase, 8),
        healthFactor: formatEther(userAccountData.healthFactor),
      })
	})});

}
