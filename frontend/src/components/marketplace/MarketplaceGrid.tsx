'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { NFTCard } from './NFTCard';

// No longer needed - we fetch names directly from IPFS metadata JSON

interface NFTData {
  tokenId: number;
  name: string;
  image: string;
  ownerAccountId: string;
  ownerEvmAddress: string;
  isOwnedByUser: boolean; // Whether the connected user owns this NFT
}

export function MarketplaceGrid() {
  const { address: connectedAddress } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);
  const [allNFTs, setAllNFTs] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleListingChange = () => {
    // Trigger a re-render to refresh all cards
    setRefreshKey(prev => prev + 1);
    fetchAllNFTs(); // Refetch to get updated ownership
  };

  // Helper function to decode base64 metadata
  const decodeMetadata = (base64Metadata: string): string => {
    try {
      const decoded = atob(base64Metadata);
      console.log('Decoded metadata:', decoded);
      return decoded;
    } catch (error) {
      console.error('Error decoding metadata:', error);
      return '';
    }
  };

  // Helper function to fetch metadata JSON from IPFS and extract image URL
  const fetchMetadataAndGetImage = async (metadataString: string): Promise<{ name: string; image: string }> => {
    try {
      // Metadata format: ipfs://bafkreihlstvojia4z7mkrdwdpzpelyzbcwfr42ikd4iktrm3q3g3krvfpm
      if (metadataString.startsWith('ipfs://')) {
        const ipfsHash = metadataString.replace('ipfs://', '');
        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

        console.log(`   Fetching metadata from: ${metadataUrl}`);

        // Fetch the JSON metadata
        const response = await fetch(metadataUrl);
        if (response.ok) {
          const metadata = await response.json();
          console.log(`   Metadata JSON:`, metadata);

          return {
            name: metadata.name || 'Unknown Badge',
            image: metadata.image || '',
          };
        }
      }
    } catch (error) {
      console.error('Error fetching metadata JSON:', error);
    }

    return { name: 'Unknown Badge', image: '' };
  };

  // Fetch ALL minted NFTs from Hedera Mirror Node
  const fetchAllNFTs = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching ALL Badge NFTs from Hedera Mirror Node...');

      const nftTokenId = '0.0.7158217'; // Badge NFT token ID
      const allNFTData: NFTData[] = [];

      // Step 1: Get connected user's Hedera account ID
      let userHederaAccountId: string | null = null;
      let userOwnedSerials: Set<number> = new Set();

      if (connectedAddress) {
        userHederaAccountId = await evmAddressToAccountId(connectedAddress);
        console.log('👤 Connected user Hedera Account:', userHederaAccountId);

        // Query NFTs owned by the connected user
        if (userHederaAccountId) {
          const userNFTsUrl = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${userHederaAccountId}/nfts?token.id=${nftTokenId}`;
          console.log('🔍 Querying user NFTs:', userNFTsUrl);

          const userResponse = await fetch(userNFTsUrl);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.nfts && Array.isArray(userData.nfts)) {
              userData.nfts.forEach((nft: any) => {
                userOwnedSerials.add(nft.serial_number);
              });
              console.log('✅ User owns serials:', Array.from(userOwnedSerials));
            }
          }
        }
      }

      // Step 2: Query Mirror Node for ALL NFTs in this token collection
      const tokenUrl = `https://testnet.mirrornode.hedera.com/api/v1/tokens/${nftTokenId}/nfts`;
      console.log('🌐 Querying all NFTs:', tokenUrl);

      const response = await fetch(tokenUrl);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 All NFTs response:', data);

        if (data.nfts && Array.isArray(data.nfts)) {
          // Process each NFT - Show ALL of them
          for (const nft of data.nfts) {
            const serial = nft.serial_number;
            const ownerAccountId = nft.account_id;
            const metadataBase64 = nft.metadata;

            // Check if this NFT is owned by the connected user
            const isOwnedByUser = userOwnedSerials.has(serial);

            console.log(`✅ NFT #${serial} - Owner: ${ownerAccountId} - Your NFT: ${isOwnedByUser}`);

            // Decode base64 metadata to get IPFS link
            const metadataString = decodeMetadata(metadataBase64);

            // Fetch the JSON metadata from IPFS and get name + image
            const { name, image } = await fetchMetadataAndGetImage(metadataString);

            // Convert Hedera account ID to EVM address
            const evmAddress = await accountIdToEvmAddress(ownerAccountId);

            allNFTData.push({
              tokenId: serial,
              name: name,
              image: image,
              ownerAccountId,
              ownerEvmAddress: evmAddress,
              isOwnedByUser: isOwnedByUser,
            });
          }
        }
      } else {
        console.error('❌ Mirror Node error:', response.status, response.statusText);
      }

      console.log('📋 Total NFTs in marketplace:', allNFTData.length);
      setAllNFTs(allNFTData);
    } catch (error) {
      console.error('❌ Error fetching NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert EVM address to Hedera Account ID
  const evmAddressToAccountId = async (evmAddress: string): Promise<string | null> => {
    try {
      const accountUrl = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${evmAddress}`;
      const response = await fetch(accountUrl);

      if (response.ok) {
        const data = await response.json();
        return data.account || null;
      }
    } catch (error) {
      console.error('Error converting EVM address to account ID:', error);
    }
    return null;
  };

  // Helper function to convert Hedera Account ID to EVM address
  const accountIdToEvmAddress = async (accountId: string): Promise<string> => {
    try {
      const accountUrl = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`;
      const response = await fetch(accountUrl);

      if (response.ok) {
        const data = await response.json();
        return data.evm_address || '0x0000000000000000000000000000000000000000';
      }
    } catch (error) {
      console.error('Error converting account ID to EVM address:', error);
    }
    return '0x0000000000000000000000000000000000000000';
  };

  // Fetch all NFTs on mount
  useEffect(() => {
    fetchAllNFTs();
  }, []);

  if (!connectedAddress) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔌</div>
        <p className="pixel-font text-lg text-gray-600">Connect your wallet to interact with the marketplace</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">⏳</div>
        <p className="pixel-font text-lg text-gray-600">Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div>
      {allNFTs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="pixel-font text-2xl text-gray-800 mb-3 font-bold">No NFTs Minted Yet</h3>
          <p className="pixel-font text-lg text-gray-600 mb-2">No Badge NFTs have been minted yet</p>
          <p className="pixel-font text-sm text-gray-500 mb-6">
            Be the first! Complete game stages to earn and mint Badge NFTs!
          </p>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 max-w-md mx-auto">
            <p className="pixel-font text-sm text-blue-800 mb-2">
              <strong>How to mint NFTs:</strong>
            </p>
            <ul className="pixel-font text-xs text-blue-700 text-left space-y-1">
              <li>1. Play Mindora Runner game</li>
              <li>2. Complete Stage 1, 2, or 3</li>
              <li>3. Claim your Badge NFT reward</li>
              <li>4. Your NFT will appear here!</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-4">
            <p className="pixel-font text-sm text-purple-900 font-bold mb-2">
              🏪 Badge NFT Collection Marketplace
            </p>
            <p className="pixel-font text-xs text-purple-700">
              📊 <strong>{allNFTs.length}</strong> Badge NFT{allNFTs.length > 1 ? 's' : ''} minted
            </p>
            <p className="pixel-font text-xs text-purple-600 mt-2">
              💡 Browse all NFTs - List yours for sale or buy from others!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" key={refreshKey}>
            {allNFTs.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                tokenId={nft.tokenId}
                badgeName={nft.name}
                badgeImage={nft.image}
                ownerAddress={nft.ownerEvmAddress}
                isOwnedByUser={nft.isOwnedByUser}
                onListingChange={handleListingChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
