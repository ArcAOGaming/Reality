import { PermissionType } from "./aoWallet";

export const permissionsRequired: Array<PermissionType> = [
  "ACCESS_ADDRESS",
  "SIGN_TRANSACTION",
  "ACCESS_PUBLIC_KEY",
  "SIGNATURE",
  "ACCESS_ALL_ADDRESSES",
  "ENCRYPT",
  "DECRYPT",
  "SIGNATURE",
  "ACCESS_ARWEAVE_CONFIG",
  "DISPATCH"
];

export const permissionsRequested = [
  ...permissionsRequired,
  // ...optionalPermissions,
];
