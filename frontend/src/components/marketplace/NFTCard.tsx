'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { getEvmContractAddresses } from '@/config/contracts';
import { NFTMarketplaceABI } from '@/config/abis/NFTMarketplaceABI';
import { useGameStore } from '@/store/gameStore';

const contracts = getEvmContractAddresses();

interface NFTCardProps {
  tokenId: number;
  badgeName: string;
  badgeImage: string;
  ownerAddress: string; // Owner EVM address passed from parent
  isOwnedByUser: boolean; // Whether the connected user owns this NFT (determined by Mirror Node)
  onListingChange?: () => void;
}

// Hedera NFT ABI (minimal for what we need)
const HEDERA_NFT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function NFTCard({ tokenId, badgeName, badgeImage, ownerAddress, isOwnedByUser, onListingChange }: NFTCardProps) {
  const { address: connectedAddress } = useAccount();
  const showNotification = useGameStore(state => state.showNotification);
  const [showListModal, setShowListModal] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Ownership determined by Mirror Node query in parent component
  const isOwner = isOwnedByUser;

  // Get listing info
  const { data: listing, refetch: refetchListing } = useReadContract({
    address: contracts.MARKETPLACE,
    abi: NFTMarketplaceABI,
    functionName: 'getListing',
    args: [BigInt(tokenId)],
  });

  // Check if user approved marketplace (only if owner)
  const { data: isApprovedForAll, refetch: refetchApproval } = useReadContract({
    address: contracts.BADGE_NFT_TOKEN as `0x${string}`,
    abi: HEDERA_NFT_ABI,
    functionName: 'isApprovedForAll',
    args: connectedAddress && contracts.MARKETPLACE
      ? [connectedAddress, contracts.MARKETPLACE]
      : undefined,
    query: {
      enabled: isOwner && !!connectedAddress, // Only query if user is owner
    },
  });

  // Approve marketplace
  const { writeContract: approve, data: approveTxHash } = useWriteContract();
  const { isLoading: isApprovePending } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // List NFT
  const { writeContract: listItem, data: listTxHash } = useWriteContract();
  const { isLoading: isListPending } = useWaitForTransactionReceipt({
    hash: listTxHash,
  });

  // Buy NFT
  const { writeContract: buyItem, data: buyTxHash } = useWriteContract();
  const { isLoading: isBuyPending } = useWaitForTransactionReceipt({
    hash: buyTxHash,
  });

  // Cancel listing
  const { writeContract: cancelListing, data: cancelTxHash } = useWriteContract();
  const { isLoading: isCancelPending } = useWaitForTransactionReceipt({
    hash: cancelTxHash,
  });

  // Handle approve
  const handleApprove = async () => {
    try {
      setIsApproving(true);
      approve({
        address: contracts.BADGE_NFT_TOKEN as `0x${string}`,
        abi: HEDERA_NFT_ABI,
        functionName: 'setApprovalForAll',
        args: [contracts.MARKETPLACE, true],
      });
    } catch (error) {
      console.error('Approval failed:', error);
      setIsApproving(false);
    }
  };

  // Handle list
  const handleList = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      showNotification('warning', 'Invalid Price', 'Please enter a valid price in HBAR');
      return;
    }

    try {
      listItem({
        address: contracts.MARKETPLACE,
        abi: NFTMarketplaceABI,
        functionName: 'listItem',
        args: [BigInt(tokenId), parseEther(listPrice)],
      });

      setShowListModal(false);
      setListPrice('');

      setTimeout(() => {
        refetchListing();
        onListingChange?.();
      }, 2000);
    } catch (error) {
      console.error('Listing failed:', error);
    }
  };

  // Handle buy
  const handleBuy = async () => {
    if (!listing?.price) return;

    try {
      buyItem({
        address: contracts.MARKETPLACE,
        abi: NFTMarketplaceABI,
        functionName: 'buyItem',
        args: [BigInt(tokenId)],
        value: listing.price,
      });

      setTimeout(() => {
        refetchListing();
        onListingChange?.();
      }, 2000);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    try {
      cancelListing({
        address: contracts.MARKETPLACE,
        abi: NFTMarketplaceABI,
        functionName: 'cancelListing',
        args: [BigInt(tokenId)],
      });

      setTimeout(() => {
        refetchListing();
        onListingChange?.();
      }, 2000);
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  useEffect(() => {
    if (approveTxHash && !isApprovePending) {
      refetchApproval();
      setIsApproving(false);
    }
  }, [approveTxHash, isApprovePending]);

  const isListed = listing?.isActive === true;
  const priceInHbar = listing?.price ? formatEther(listing.price) : '0';

  return (
    <>
      <div className="border-2 border-gray-300 rounded-lg p-4 bg-white hover:shadow-lg transition-shadow">
        {/* NFT Image */}
        <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
          {badgeImage ? (
            <img src={badgeImage} alt={badgeName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl font-bold text-white">#{tokenId}</span>
          )}
        </div>

        {/* NFT Info */}
        <div className="mb-3">
          <h3 className="pixel-font text-lg font-bold text-gray-800 mb-1">{badgeName}</h3>
          <p className="pixel-font text-xs text-gray-600">Serial #: {tokenId}</p>

          {/* Owner info */}
          <p className="pixel-font text-xs text-gray-500 mt-1">
            {isOwner ? '👤 You own this' : `👤 ${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`}
          </p>

          {isListed && (
            <div className="mt-2 bg-green-50 border border-green-300 rounded p-2">
              <p className="pixel-font text-xs text-green-800 font-bold">📍 Listed for Sale</p>
              <p className="pixel-font text-lg font-bold text-green-600">{parseFloat(priceInHbar).toFixed(4)} HBAR</p>
              {listing?.seller && (
                <p className="pixel-font text-xs text-gray-600 truncate">
                  Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {!connectedAddress && (
            <p className="pixel-font text-xs text-center text-gray-500">Connect wallet to interact</p>
          )}

          {connectedAddress && !isOwner && isListed && (
            <button
              onClick={handleBuy}
              disabled={isBuyPending}
              className="nes-btn is-primary pixel-font w-full text-xs"
            >
              {isBuyPending ? 'BUYING...' : 'BUY NOW'}
            </button>
          )}

          {connectedAddress && !isOwner && !isListed && (
            <p className="pixel-font text-xs text-center text-gray-500">Not for sale</p>
          )}

          {connectedAddress && isOwner && !isListed && !isApprovedForAll && (
            <button
              onClick={handleApprove}
              disabled={isApproving || isApprovePending}
              className="nes-btn is-warning pixel-font w-full text-xs"
            >
              {isApproving || isApprovePending ? 'APPROVING...' : 'APPROVE MARKETPLACE'}
            </button>
          )}

          {connectedAddress && isOwner && !isListed && isApprovedForAll && (
            <button
              onClick={() => setShowListModal(true)}
              className="nes-btn is-success pixel-font w-full text-xs"
            >
              LIST FOR SALE
            </button>
          )}

          {connectedAddress && isOwner && isListed && (
            <button
              onClick={handleCancel}
              disabled={isCancelPending}
              className="nes-btn is-error pixel-font w-full text-xs"
            >
              {isCancelPending ? 'CANCELING...' : 'CANCEL LISTING'}
            </button>
          )}
        </div>
      </div>

      {/* List Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="nes-container pixel-art bg-white max-w-md w-full">
            <h3 className="pixel-font text-xl font-bold text-gray-800 mb-4">List {badgeName}</h3>

            <div className="mb-4">
              <label className="pixel-font text-sm text-gray-700 block mb-2">Price in HBAR</label>
              <input
                type="number"
                step="0.1"
                placeholder="10.0"
                className="nes-input pixel-font w-full"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
              />
              <p className="pixel-font text-xs text-gray-500 mt-1">
                Minimum: 0.1 HBAR
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowListModal(false)}
                className="nes-btn pixel-font flex-1 text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleList}
                disabled={isListPending}
                className="nes-btn is-primary pixel-font flex-1 text-xs"
              >
                {isListPending ? 'LISTING...' : 'LIST NFT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
