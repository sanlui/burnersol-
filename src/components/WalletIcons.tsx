import React from "react";
import { FaGhost, FaSun } from "react-icons/fa";
import { BiSolidBackpack } from "react-icons/bi";
import { SiSolana } from "react-icons/si";

interface WalletIconProps {
  className?: string;
}

export function PhantomIcon({ className = "w-4 h-4" }: WalletIconProps) {
  return (
    <span className={`${className} flex items-center justify-center text-[#AB9FF2] shrink-0`}>
      <FaGhost size="100%" />
    </span>
  );
}

export function SolflareIcon({ className = "w-4 h-4" }: WalletIconProps) {
  return (
    <span className={`${className} flex items-center justify-center text-[#FAB214] shrink-0`}>
      <FaSun size="100%" />
    </span>
  );
}

export function BackpackIcon({ className = "w-4 h-4" }: WalletIconProps) {
  return (
    <span className={`${className} flex items-center justify-center text-[#E42525] shrink-0`}>
      <BiSolidBackpack size="100%" />
    </span>
  );
}

export function SolanaRpcIcon({ className = "w-4 h-4" }: WalletIconProps) {
  return (
    <span className={`${className} flex items-center justify-center text-[#14F195] shrink-0`}>
      <SiSolana size="100%" />
    </span>
  );
}
