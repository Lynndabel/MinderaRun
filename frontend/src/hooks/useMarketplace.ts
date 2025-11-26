import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { NFTMarketplaceABI } from '../config/abis';
import { getEvmContractAddresses } from '../config/contracts';

const { MARKETPLACE } = getEvmContractAddresses();

export const useMarketplace = () => {
    // Example hook for getting a listing
    const getListing = (tokenId: number) => {
        return useReadContract({
            abi: NFTMarketplaceABI,
            address: MARKETPLACE,
            functionName: 'getListing',
            args: [BigInt(tokenId)],
        });
    };

    // Example hook for buying an item
    const { data: buyItemHash, writeContract: buyItem } = useWriteContract();
    const { isLoading: isBuyItemLoading, isSuccess: isBuyItemSuccess } = useWaitForTransactionReceipt({
        hash: buyItemHash,
    });

    // Add more hooks for listItem, cancelListing, etc.

    return {
        getListing,
        buyItem,
        isBuyItemLoading,
        isBuyItemSuccess,
    };
};
