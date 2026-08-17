export interface NamedApiResource {
  name: string;
  url: string;
}

export interface ApiResource {
  url: string;
}

export interface Name {
  name: string;
  language: NamedApiResource;
}

export interface FlavorText {
  flavor_text: string;
  language: NamedApiResource;
  version: NamedApiResource;
}
