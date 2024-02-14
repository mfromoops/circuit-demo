import {
  RestClient,
  StaticTokenClient,
  createDirectus,
  readItems,
  rest,
  staticToken,
} from "@directus/sdk";
type OrderInfo = {
  id: string;
  client: Client;
  order: Order;
  order_total: number;
  client_paid: boolean;
};
type Client = {
  name: string;
  last_names: string;
};

type Order = {
  Order_id: string;
  store_id: Store;
  pickup_location: string;
  delivery_location: string;
};
type Store = {
  store_id: string;
  name: string;
  address: string;
  town: string;
};

type DirectusSchema = {
  order_info: OrderInfo[];
  Stores: Store[];
  Orders: Order[];
  Client: Client[];
};
export class DirectusClient {
  private client: RestClient<DirectusSchema> &
    StaticTokenClient<DirectusSchema>;
  constructor(private access_token: string) {
    this.client = createDirectus<DirectusSchema>("https://api.loadds.com")
      .with(rest())
      .with(staticToken(access_token));
  }

  getOrders() {
    return this.client.request(
      readItems("order_info", {
        fields: [
          "id",
          { client: ["name", "last_names"] },
          {
            order: [
              "pickup_location",
              "delivery_location",
              { store_id: ["name", "address", "town"] },
            ],
          },
          "order_total",
          "client_paid",
        ],
        filter: {
          client_paid: {
            _eq: true,
          },
        },
      }),
    );
  }
}
