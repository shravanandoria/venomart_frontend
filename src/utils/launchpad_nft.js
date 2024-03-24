import { Address } from "everscale-inpage-provider";
import LaunchpadABI from "../../abi/LaunchpadContract.abi.json";
import { launchpad_nft_fees } from "./user_nft";

// initiating launchpad contract
const launchpad_contract = (provider, launchpad_address) => {
  const contract = new provider.Contract(LaunchpadABI, launchpad_address);
  return contract;
};

// main mint function to mint NFT
export const launchpad_mint = async (provider, launchpad_address, signer_address, amount_to_mint, current_phase) => {
  const launchpad = launchpad_contract(provider, launchpad_address);
  const req_amount = await launchpad.methods
    .cal_minting_amount({
      answerId: 0,
      amount: amount_to_mint,
      current_phase_: current_phase,
    })
    .call();

  await launchpad.methods.mint({ amount: amount_to_mint }).send({
    from: new Address(signer_address),
    amount: (parseInt(req_amount.value0) + parseInt(launchpad_nft_fees)).toString(),
  });
};

// get how many nfts user minted
export const get_address_mint_count = async (provider, launchpad_address, phase_number, signer_address) => {
  const launchpad = launchpad_contract(provider, launchpad_address);
  const res = await launchpad.methods
    .get_address_mint_count({
      answerId: 0,
      phase_num: phase_number,
      addr: signer_address,
    })
    .call();
  return res.value0;
};

// get user public mint count
export const get_public_mint_count = async (provider, launchpad_address, signer_address) => {
  const launchpad = launchpad_contract(provider, launchpad_address);
  const res = await launchpad.methods.get_public_mint_count({ answerId: 0, addr: signer_address });
  return res;
};

// getting total minted
export const get_total_minted = async (provider, launchpad_address) => {
  try {
    const launchpad = launchpad_contract(provider, launchpad_address);
    const res = await launchpad.methods.get_total_minted({ answerId: 0 }).call();
    return res.value0;
  } catch (error) {
    console.log(error);
  }
};
