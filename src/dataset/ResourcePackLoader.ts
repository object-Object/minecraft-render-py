//@ts-ignore
import * as deepAssign from "assign-deep";
import { AnimationMeta } from "../utils/types";
import {
  ResourceLoader,
  ModelBlock,
  ModelBlockstate,
  ModelBlockstateFile,
} from "./types";
import { constructPath } from "./utils";
import { Logger } from "../utils/logger";

export class ResourcePackLoader {
  private dataProvider: ResourceLoader;

  constructor(dataProvider: ResourceLoader) {
    this.dataProvider = dataProvider;
  }

  getBlockstate(namespace: string, identifier?: string): Promise<ModelBlockstateFile> {
    return this.dataProvider.loadJSON(
      constructPath("blockstates", "json", namespace, identifier)
    );
  }

  getDefaultModelblockstate(
    namespace: string,
    identifier?: string
  ): Promise<ModelBlockstate> {
    return this.getBlockstate(namespace, identifier).then((record) => {
      try {
        if ("variants" in record) {
          let blockstate = Object.values(record.variants)[0];
          blockstate = Array.isArray(blockstate) ? blockstate[0] : blockstate;
          return blockstate;
        }
      } catch (e) {}
      throw new Error();
    });
  }

  getTexture(namespace: string, identifier?: string): Promise<Uint8Array> {
    Logger.debug(() => `getTexture(${namespace}, ${identifier})`);
    return this.dataProvider.loadTexture(
      constructPath("textures", "png", namespace, identifier)
    );
  }

  async getAnimationData(
    namespace: string,
    identifier?: string
  ): Promise<AnimationMeta | null> {
    try {
      return await this.dataProvider.loadJSON(
        constructPath("textures", "png.mcmeta", namespace, identifier)
      );
    } catch (e) {
      return null;
    }
  }

  async getTextureAsBuffer(namespace: string, identifier?: string): Promise<Buffer> {
    return Buffer.from(await this.getTexture(namespace, identifier));
  }

  getModel(namespace: string, identifier?: string): Promise<ModelBlock> {
    return this.dataProvider.loadJSON(
      constructPath("models", "json", namespace, identifier)
    );
  }

  getModels(namespace: string, identifier?: string): Promise<ModelBlock[]> {
    return this.getModel(namespace, identifier).then((model) => {
      // If we have a parent
      if (model.parent != undefined) {
        return this.getModels(model.parent).then((models) => {
          return models.concat(model);
        });
      } else {
        return [model];
      }
    });
  }

  getCompiledModel(namespace: string, identifier?: string): Promise<ModelBlock> {
    return this.getModels(namespace, identifier).then((models) =>
      models.reduce((o, m) => deepAssign(o, m), {})
    ) as Promise<ModelBlock>;
  }
}
