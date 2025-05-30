import {
  AoContractClient,
  createAoContractClient,
} from "../../ao/lib/aoContractClient";
import { AoWallet } from "@/features/ao/lib/aoWallet";
import { profileAOS } from "./config";
import { fetchUrl } from "@/features/arweave/lib/arweave";
import { ProfileInfoCreate } from "./model";
import { MessageResult } from "@/features/ao/lib/aoClient";
import { connect } from "@/features/ao/lib/aoConnection";

export type ProfileClient = {
  aoContractClient: AoContractClient;

  // Reads

  // Writes
  initializeProcess(): Promise<MessageResult>;
  updateProfile(profile: ProfileInfoCreate): Promise<string>;
};

// Placeholder
// TODO: Define these methods properly
export const createProfileClient = (
  aoContractClient: AoContractClient,
): ProfileClient => ({
  aoContractClient: aoContractClient,

  // Writes
  initializeProcess: async () => {
    const profileSrc = await fetch(fetchUrl(profileAOS.profileSrc)).then(
      (res) => res.text(),
    );
    const messageResult = await aoContractClient.messageResult({
      tags: [{ name: "Action", value: "Eval" }],
      data: profileSrc,
    });
    const error = messageResult.Error;
    if (error !== undefined) {
      throw new Error(error);
    }
    return messageResult;
  },
  updateProfile: async (profile: ProfileInfoCreate) =>
    aoContractClient.message({
      tags: [{ name: "Action", value: "Update-Profile" }],
      data: JSON.stringify(profile),
    }),
});

export const createProfileClientForProcess =
  (wallet: AoWallet) => (processId: string) => {
    const aoContractClient = createAoContractClient(
      processId,
      connect(),
      wallet,
    );
    return createProfileClient(aoContractClient);
  };
