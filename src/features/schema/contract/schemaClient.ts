import { connect } from "@/features/ao/lib/aoConnection";
import {
  AoContractClient,
  createAoContractClient,
} from "../../ao/lib/aoContractClient";
import { Schema, SchemaExternal } from "./model";
import { AoWallet } from "@/features/ao/lib/aoWallet";

export type SchemaClient = {
  aoContractClient: AoContractClient;

  // Reads
  readSchema(): Promise<Schema>;
  readSchemaExternal(): Promise<SchemaExternal>;
};

// Placeholder
// TODO: Define these methods properly
export const createSchemaClient = (
  aoContractClient: AoContractClient,
): SchemaClient => ({
  aoContractClient: aoContractClient,

  // Read
  readSchema: () =>
    aoContractClient.messageDelayReplyOneJson<Schema>(
      {
        tags: [{ name: "Action", value: "Schema" }],
      } /* Schema */,
    ),
  readSchemaExternal: () =>
    aoContractClient.messageDelayReplyOneJson<SchemaExternal>(
      {
        tags: [{ name: "Action", value: "SchemaExternal" }],
      } /* SchemaExternal */,
    ),
});

export const createSchemaClientForProcess =
  (wallet: AoWallet) => (processId: string) => {
    const aoContractClient = createAoContractClient(
      processId,
      connect(),
      wallet,
    );
    return createSchemaClient(aoContractClient);
  };
