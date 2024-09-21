export interface IModelParser {
  id: string;
  name: string;
  generated: boolean;
  checked: boolean;
  isLoaded: boolean;
}
export interface IProjectParser {
  id: string;
  name: string;
  models: IModelParser[];
}
export interface IModel {
  id: string;
  name: string;
  versionId: string;
  meta: any;
}
export interface IProject {
  id: string;
  name: string;
  models: IModel[];
}
export interface IModelTree {
  id: string;
  name: string;
  children: IModelTree[];
  checked: boolean;
  expandIds: string[];
  type: "project" | "model";
}
export interface ISpatialStructure {
  type: string;
  expressID: number;
  children: ISpatialStructure[];
}
