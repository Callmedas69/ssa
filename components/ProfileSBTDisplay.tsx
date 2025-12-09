"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi/config";
import { CONTRACTS } from "@/abi/addresses";
import { ProfileSBTABI } from "@/abi/ProfileSBT";

interface ProfileSBTDisplayProps {
  hasMinted?: boolean;
}

export function ProfileSBTDisplay({ hasMinted }: ProfileSBTDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!hasMinted) return;

    async function fetchContractImage() {
      try {
        const uri = await readContract(wagmiConfig, {
          address: CONTRACTS.ProfileSBT as `0x${string}`,
          abi: ProfileSBTABI,
          functionName: "contractURI",
        });

        if (uri) {
          const metadata = JSON.parse(atob((uri as string).split(",")[1]));
          setImageUrl(metadata.image);
        }
      } catch (error) {
        console.error("Error fetching contract image:", error);
      }
    }

    fetchContractImage();
  }, [hasMinted]);

  return (
    <div className="relative w-64 h-64 mac1-inset bg-white flex items-center justify-center">
      {imageUrl ? (
        <Image src={imageUrl} alt="Profile SBT" fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex justify-center items-center text-center p-4">
          <div className="text-[11px] text-black">
            {hasMinted ? "Loading..." : "No SBT"}
          </div>
        </div>
      )}
    </div>
  );
}
