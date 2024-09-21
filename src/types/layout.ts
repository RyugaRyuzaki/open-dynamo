export interface INavLink {
  name: string;
  description: string;
  path: string;
  directory: string;
  children: INavLink[];
}
