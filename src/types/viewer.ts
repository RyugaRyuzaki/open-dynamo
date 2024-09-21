import {ComponentType} from "react";

export interface IViewerLink {
  title: string;
  path: string;
  Component: ComponentType;
  uuid: string;
}
