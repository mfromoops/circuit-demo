export type Address = {
  street: string;
  country: string;
  city: string;
  zip: string;
};

export type UserAddress = {
  id: string;
  addressLineOne?: string;
  addressLineTwo?: string;
  latitute?: number;
  longitude?: number;
}

export type MapsResults = {
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
    address_components: any[];
    place_id: string;
    partial_match: boolean;
    types: string[];
  }[];
  status: string;
};
