import { Address } from "everscale-inpage-provider";
import moment from "moment";
import LaunchpadABI from "../../new_abi/Fixed_CollectionDrop.abi.json";

const SAMPLE_LAUNCHPAD_ADDR = "0:c427a87eba0007f85e38dfa6444c4e475504adac738ac65640a30db3696be132";

// extra amount for mint refundable
const ONE_VENOM = 1000000000;
const extra_tokens = 0.1 * ONE_VENOM;

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
export const launchpad_mint = async (
  provider,
  launchpad_address,
  signer_address,
  amount_to_mint,
  current_phase,
  payable_amount,
) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);
  console.log({ current_phase });
  console.log({ amount_to_mint });

  const req_amount = await launchpad.methods
    .cal_minting_amount({
      answerId: 0,
      amount: amount_to_mint,
      current_phase_: current_phase,
    })
    .call();

  await launchpad.methods.mint({ amount: amount_to_mint }).send({
    from: new Address(signer_address),
    amount: (parseInt(req_amount.value0) + parseInt(extra_tokens)).toString(),
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

// getting max supply of collection
export const get_max_supply = async (provider, launchpad_address) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);
  const res = await launchpad.methods.get_max_supply({ answerId: 0, phase_num: current_phase, addr: signer_address });
};

// getting total minted
export const get_total_minted = async (provider, launchpad_address) => {
  const launchpad = launchpad_contract(provider, SAMPLE_LAUNCHPAD_ADDR);
  const res = await launchpad.methods.get_total_minted({ answerId: 0 }).call();
  return res.value0;
};
