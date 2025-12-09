"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi/config";
import { CONTRACTS } from "@/abi/addresses";
import { ProfileSBTABI } from "@/abi/ProfileSBT";

interface ProfileSBTDisplayProps {
  address: string;
  hasMinted?: boolean;
}

export function ProfileSBTDisplay({
  address,
  hasMinted,
}: ProfileSBTDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!hasMinted) return;

    async function fetchSBTImage() {
      try {
        const tokenId = await readContract(wagmiConfig, {
          address: CONTRACTS.ProfileSBT as `0x${string}`,
          abi: ProfileSBTABI,
          functionName: "getProfileTokenId",
          args: [address as `0x${string}`],
        });

        const uri = await readContract(wagmiConfig, {
          address: CONTRACTS.ProfileSBT as `0x${string}`,
          abi: ProfileSBTABI,
          functionName: "tokenURI",
          args: [tokenId as bigint],
        });

        if (uri) {
          const metadata = JSON.parse(atob((uri as string).split(",")[1]));
          setImageUrl(metadata.image);
        }
      } catch (error) {
        console.error("Error fetching SBT:", error);
      }
    }

    fetchSBTImage();
  }, [address, hasMinted]);

  return (
    <div className="relative w-32 h-32 mac1-inset bg-white flex items-center justify-center">
      {imageUrl ? (
        <Image src={imageUrl} alt="Profile SBT" fill className="object-cover" />
      ) : (
        <div className="text-center p-4">
          <div className="text-4xl mb-1">🎭</div>
          <div className="text-[11px] text-black">
            {hasMinted ? "Loading..." : "No SBT"}
          </div>
        </div>
      )}
    </div>
  );
}
