import { Address } from "everscale-inpage-provider";
import moment from "moment";
import LaunchpadABI from "../../new_abi/Fixed_CollectionDrop.abi.json";

const SAMPLE_LAUNCHPAD_ADDR = "0:5b951447168aa22548ed8d6084e887af71642a9e2214904fc57d6a6e2254f982";

// extra amount for mint refundable
const extra_tokens = "100000000";

// initiating launchpad contract
const launchpad_contract = (provider, launchpad_address) => {
  const contract = new provider.Contract(LaunchpadABI, launchpad_address);
  return contract;
};

// pass array of phases ex:- [123123, 456456, 789789]
export const cal_current_phase = all_phases => {
  const current_time = moment().unix;
  let current_phase = 0;

  for (let i = 0; i < all_phases.length; i++) {
    if (current_time > all_phases[i]) {
      current_phase = all_phases[i];
    }
  }
  
  console.log({ current_phase });
  return current_phase;
};

// get all total phases
export const get_total_phases = async (provider, launchpad_address) => {
  const launchpad = launchpad_contract(provider, launchpad_address);

  const res = await launchpad.methods.get_total_phases({ answerId: 0 });

  console.log({ res });
};

// main mint function to mint NFT
export const launchpad_mint = async (provider, launchpad_address, signer_address, amount_to_mint, all_phases) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);

  // Checks, current time fits in which phase, so that we can get the amount required to mint
  // if returned 0, means 1st phase has not started
  const current_phase = cal_current_phase(all_phases);

  const amount_to_mint_ = launchpad.methods
    .cal_minting_amount({ answerId: 0, amount: amount_to_mint, current_phase: current_phase })
    .call();

  await launchpad.methods.mint({ amount: amount_to_mint }).send({
    from: new Address(signer_address),
    amount: amount_to_mint_.value0 + extra_tokens,
  });
};

// get how many nfts user minted
export const get_address_mint_count = async (provider, launchpad_address, signer_address, all_phases) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);

  const current_phase = cal_current_phase(all_phases);

  const res = await launchpad.methods.get_address_mint_count({
    answerId: 0,
    phase_num: current_phase,
    addr: signer_address,
  });

  console.log({ res });
};

// get user public mint count
export const get_public_mint_count = async (provider, launchpad_address, signer_address) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);

  const res = await launchpad.methods.get_public_mint_count({ answerId: 0, addr: signer_address });

  console.log({ res });
};

// get user eligibility status for mint
export const get_eligibility_status = async (provider, launchpad_address, signer_address, all_phases) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);

  const current_phase = cal_current_phase(all_phases);

  const res = await launchpad.methods.get_eligibility_status({
    answerId: 0,
    phase_num: current_phase,
    addr: signer_address,
  });

  console.log({ res });
};

// get end date of mint
export const get_public_mint_deadline = async (provider, launchpad_address) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);

  const res = await launchpad.methods.get_public_mint_deadline({ answerId: 0 });

  console.log({ res });
};

// get all max minting limits
export const get_max_mint_limit = async (provider, launchpad_address) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);

  const res = await launchpad.methods.get_max_mint_limit({ answerId: 0 });

  console.log({ res });
};

// get all phases names
export const get_phases_name = async (provider, launchpad_address) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);

  const res = await launchpad.methods.get_phases_name({ answerId: 0 });

  console.log({ res });
};

// getting max supply of collection
export const get_max_supply = async (provider, launchpad_address) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);

  const res = await launchpad.methods.get_max_supply({ answerId: 0, phase_num: current_phase, addr: signer_address });

  console.log({ res });
};

// getting total minted
export const get_total_minted = async (provider, launchpad_address) => {
  console.log({ provider });
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);

  const res = await launchpad.methods.get_total_minted({ answerId: 0 }).call();

  return res.value0;
};
