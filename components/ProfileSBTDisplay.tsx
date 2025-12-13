"use client";

import { useEffect, useState } from "react";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi/config";
import { CONTRACTS } from "@/abi/addresses";
import { ProfileSBTABI } from "@/abi/ProfileSBT";

interface ProfileSBTDisplayProps {
  hasMinted?: boolean;
  address?: `0x${string}`;
}

export function ProfileSBTDisplay({ hasMinted, address }: ProfileSBTDisplayProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchImage() {
      setIsLoading(true);
      setSvgContent(null);
      setFallbackImage(null);

      try {
        let imageData: string | null = null;

        if (hasMinted && address) {
          // Minted: fetch tokenURI for animated SBT
          const tokenId = await readContract(wagmiConfig, {
            address: CONTRACTS.ProfileSBT as `0x${string}`,
            abi: ProfileSBTABI,
            functionName: "getProfileTokenId",
            args: [address],
          });

          if (tokenId) {
            const uri = await readContract(wagmiConfig, {
              address: CONTRACTS.ProfileSBT as `0x${string}`,
              abi: ProfileSBTABI,
              functionName: "tokenURI",
              args: [tokenId],
            });

            if (uri) {
              const metadata = JSON.parse(atob((uri as string).split(",")[1]));
              // Use animation_url for animated SVG, fallback to image
              imageData = metadata.animation_url || metadata.image;
            }
          }
        } else {
          // Not minted: fetch contractURI for collection image
          const uri = await readContract(wagmiConfig, {
            address: CONTRACTS.ProfileSBT as `0x${string}`,
            abi: ProfileSBTABI,
            functionName: "contractURI",
          });

          if (uri) {
            const metadata = JSON.parse(atob((uri as string).split(",")[1]));
            imageData = metadata.image;
          }
        }

        if (imageData) {
          // Check if it's a base64 SVG and decode for inline rendering (enables CSS animations)
          if (imageData.startsWith("data:image/svg+xml;base64,")) {
            const base64 = imageData.split(",")[1];
            const decoded = atob(base64);
            setSvgContent(decoded);
          } else {
            // Non-SVG image, use as fallback
            setFallbackImage(imageData);
          }
        }
      } catch (error) {
        console.error("Error fetching SBT image:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImage();
  }, [hasMinted, address]);

  return (
    <div className="relative w-48 sm:w-64 aspect-square bg-white flex items-center justify-center overflow-hidden">
      {svgContent ? (
        // Inline SVG for CSS animation support
        <div
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full rounded-xl"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : fallbackImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackImage}
          alt="Profile SBT"
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        <div className="w-full h-full flex justify-center items-center text-center p-4">
          <div className="text-[11px] text-black">
            {isLoading ? "Loading..." : "No Image"}
          </div>
        </div>
      )}
    </div>
  );
}
