export let venomProvider;
export let address;

export const getAddress = async (provider) => {
  const providerState = await provider?.getProviderState?.();
  return providerState?.permissions.accountInteraction?.address.toString();
};
// Any interaction with venom-wallet (address fetching is included) needs to be authentificated
export const checkAuth = async (_venomConnect) => {
  const auth = await _venomConnect?.checkAuth();
  if (auth) await getAddress(_venomConnect);
};
// This handler will be called after venomConnect.login() action
// connect method returns provider to interact with wallet, so we just store it in state
export const onConnect = async (provider) => {
  venomProvider = provider;
  const addr = await onProviderReady(provider);
  address = addr;
};
// This handler will be called after venomConnect.disconnect() action
// By click logout. We need to reset address and balance.
export const onDisconnect = async () => {
  venomProvider?.disconnect();
  return undefined;
};
// When our provider is ready, we need to get address and balance from.
export const onProviderReady = async (provider) => {
  const venomWalletAddress = provider ? await getAddress(provider) : undefined;
  return venomWalletAddress;
};
