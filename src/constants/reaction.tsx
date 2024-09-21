import {IReaction} from "@/types/reaction";
import {MathUtils} from "three";

export const listReaction: IReaction[] = [
  {
    uuid: MathUtils.generateUUID(),
    emoji: <>😀</>,
  },
  {
    uuid: MathUtils.generateUUID(),
    emoji: <>😀</>,
  },
  {
    uuid: MathUtils.generateUUID(),
    emoji: <>😃</>,
  },
  {
    uuid: MathUtils.generateUUID(),
    emoji: <>😁</>,
  },
  {
    uuid: MathUtils.generateUUID(),
    emoji: <>😆</>,
  },
  {
    uuid: MathUtils.generateUUID(),
    emoji: <>😂</>,
  },
  {
    uuid: MathUtils.generateUUID(),
    emoji: <>😍</>,
  },
  {
    uuid: MathUtils.generateUUID(),
    emoji: <>🥰</>,
  },
  {
    uuid: MathUtils.generateUUID(),
    emoji: <>😘</>,
  },
];
