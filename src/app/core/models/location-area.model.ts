import { Name, NamedApiResource } from './common.model';

export interface LocationArea {
  id: number;
  name: string;
  location: NamedApiResource;
  names: Name[];
}
