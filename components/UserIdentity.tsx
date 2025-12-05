import { memo } from 'react';
import type { UserIdentity as UserIdentityType } from '@/lib/types';

interface UserIdentityProps {
  identity: UserIdentityType | null;
  address: string;
}

export const UserIdentity = memo(function UserIdentity({ identity, address }: UserIdentityProps) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const hasIdentity = identity?.ens || identity?.basename;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Primary identity (ENS or Basename) */}
      {hasIdentity && (
        <div className="flex items-center gap-2">
          {identity?.basename && (
            <span className="text-lg font-semibold text-primary">
              {identity.basename}
            </span>
          )}
          {identity?.ens && !identity?.basename && (
            <span className="text-lg font-semibold text-primary">
              {identity.ens}
            </span>
          )}
          {identity?.ens && identity?.basename && (
            <span className="text-sm text-muted-foreground">
              ({identity.ens})
            </span>
          )}
        </div>
      )}

      {/* Address (always shown) */}
      <span className="text-xs text-muted-foreground font-mono">
        {shortAddress}
      </span>

      {/* Identity badges */}
      {hasIdentity && (
        <div className="flex items-center gap-2 mt-1">
          {identity?.basename && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Basename
            </span>
          )}
          {identity?.ens && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              ENS
            </span>
          )}
        </div>
      )}
    </div>
  );
});
