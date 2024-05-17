import { Address } from "everscale-inpage-provider";
import LaunchpadABI from "../../abi/LaunchpadContract.abi.json";
import LaunchpadABI2 from "../../abi/DragonLaunchpad.abi.json"; // remove this later
import { ONE_VENOM, launchpad_nft_fees } from "./user_nft";

// initiating launchpad contract
const launchpad_contract = (provider, launchpad_address) => {
  if (!provider || !launchpad_address) return;
  const contract = new provider.Contract(LaunchpadABI, launchpad_address);
  return contract;
};

// remove this later
const dragon_launchpad_contract = (provider, launchpad_address) => {
  if (!provider || !launchpad_address) return;
  const contract = new provider.Contract(LaunchpadABI2, launchpad_address);
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

  const res = await launchpad.methods.mint({ amount: amount_to_mint }).send({
    from: new Address(signer_address),
    amount: (parseInt(req_amount.value0) + parseInt(launchpad_nft_fees)).toString(),
  });
  return res;
};

// remove this later
export const launchpad_mint_dragonz = async (provider, launchpad_address, signer_address, amount_to_mint, current_phase) => {
  let phase_to_mint = current_phase + 1;
  let phase_mint_price;
  if (phase_to_mint == 1) {
    phase_mint_price = 36000000000;
  }
  else {
    phase_mint_price = 72000000000;
  }
  const launchpad = dragon_launchpad_contract(provider, launchpad_address);
  const res = await launchpad.methods.mintNftByType({ _sourceId: 1, _boxTypeIndex: phase_to_mint, _owner: signer_address }).send({
    from: new Address(signer_address),
    amount: (parseInt(phase_mint_price) + parseInt(2000000000)).toString(),
  });
  return res;
};


// getting total minted
export const launchpad_mint_creator = async (provider, signer_address, launchpad_address, reciever_address, amount_to_mint) => {
  let finalCost = (0.7 * (amount_to_mint) * ONE_VENOM);
  try {
    const launchpad = launchpad_contract(provider, launchpad_address);
    const res = await launchpad.methods.collection_creator_mint({ nft_receiver: reciever_address, mint_amount: amount_to_mint }).send({
      from: new Address(signer_address),
      amount: (parseInt(finalCost) + parseInt(launchpad_nft_fees)).toString(),
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};


// get how many nfts user minted
export const get_address_mint_count = async (provider, launchpad_address, phase_number, signer_address) => {
  if (!provider || !launchpad_address || !signer_address) return;
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
  if (!provider || !launchpad_address || !signer_address) return;
  const launchpad = launchpad_contract(provider, launchpad_address);
  const res = await launchpad.methods.get_public_mint_count({ answerId: 0, addr: signer_address });
  return res;
};

// getting total minted
export const get_total_minted = async (provider, launchpad_address) => {
  if (!provider || !launchpad_address) return;
  try {
    let returnValue;
    const launchpad = launchpad_contract(provider, launchpad_address);
    const res = await launchpad.methods.totalSupply({ answerId: 0 }).call();
    returnValue = res.count;
    if (res.count == 0) {
      const res = await launchpad.methods.get_total_minted({ answerId: 0 }).call();
      returnValue = res.value0;
    }
    return returnValue;
  } catch (error) {
    console.log(error);
  }
};
