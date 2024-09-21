export interface INodeCategory {
  id: number;
  name: string;
}
export type INodeType =
  | "Element"
  | "Relation"
  | "ExpressID"
  | "ElementProperty";
