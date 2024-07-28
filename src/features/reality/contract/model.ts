import { z } from "zod";
import { _2dTileParams } from "./_2dTile";
import { ArweaveAddress } from "@/features/arweave/lib/model";

export const RealityVector = z.array(z.number());
export type RealityVector = z.infer<typeof RealityVector>;

export const RealityInfo = z.object({
  Parent: z.string(),
  Name: z.string(),
  Dimensions: z.number(),
  "Render-With": z.string(),
});
export type RealityInfo = z.infer<typeof RealityInfo>;

export const RealityParameterBounds = z.object({
  Lower: z.array(z.number()),
  Upper: z.array(z.number()),
});

export const RealityParameters = z.object({
  Bounds: z.optional(RealityParameterBounds),
  "2D-Tile-0": z.optional(_2dTileParams),
});
export type RealityParameters = z.infer<typeof RealityParameters>;

export const RealityEntityType = z.enum(["Unknown", "Avatar", "Hidden"]);
export type RealityEntityType = z.infer<typeof RealityEntityType>;

export const RealityEntityPosition = RealityVector;
export type RealityEntityPosition = z.infer<typeof RealityEntityPosition>;

export const DefaultInteraction = z.object({
  Type: z.literal("Default"),
});
export type DefaultInteraction = z.infer<typeof DefaultInteraction>;

export const Warp = z.object({
  Type: z.literal("Warp"),
  Size: z.optional(z.array(z.number())),
});
export type Warp = z.infer<typeof Warp>;

export const SchemaForm = z.object({
  Type: z.literal("SchemaForm"),
  Id: z.string(),
});
export type SchemaForm = z.infer<typeof SchemaForm>;

export const SchemaExternalForm = z.object({
  Type: z.literal("SchemaExternalForm"),
  Id: z.string(),
});
export type SchemaExternalForm = z.infer<typeof SchemaForm>;

export const RealityEntityMetadata = z.intersection(
  z.object({
    Interaction: z.optional(
      z.discriminatedUnion("Type", [
        DefaultInteraction,
        Warp,
        SchemaForm,
        SchemaExternalForm,
      ]),
    ),
    ProfileId: z.optional(z.string()),
    DisplayName: z.optional(z.string()),
    SkinNumber: z.optional(z.number()),
    SpriteTxId: z.optional(z.string()),
  }),
  z.record(z.string(), z.any()),
);
export type RealityEntityMetadata = z.infer<typeof RealityEntityMetadata>;

export const RealityEntity = z.object({
  Position: RealityEntityPosition,
  Type: RealityEntityType,
  Metadata: z.optional(RealityEntityMetadata),
  StateCode: z.optional(z.number()),
});
export type RealityEntity = z.infer<typeof RealityEntity>;

export const RealityEntityCreate = z.object({
  Type: z.optional(RealityEntityType),
  Position: z.optional(RealityEntityPosition),
  Metadata: z.optional(RealityEntityMetadata),
});
export type RealityEntityCreate = z.infer<typeof RealityEntityCreate>;

export const RealityEntities = z.record(ArweaveAddress, RealityEntity);
export type RealityEntities = z.infer<typeof RealityEntities>;

export const RealityEntityKeyed = RealityEntities.refine(
  (entities) => Object.keys(entities).length === 1,
  {
    message: "Expected exactly one entity",
  },
);
export type RealityEntityKeyed = z.infer<typeof RealityEntityKeyed>;
