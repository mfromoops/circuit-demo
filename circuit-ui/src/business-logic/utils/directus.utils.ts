import {
  RestClient,
  StaticTokenClient,
  createDirectus,
  readItems,
  rest,
  staticToken,
  updateItem,
} from "@directus/sdk";
export type OrderInfo = {
  id: string;
  client: Client;
  order: Order;
  order_total: number;
  client_paid: boolean;
  routeId: string | null | undefined;
  planId: string | null | undefined;
};
export type Client = {
  name: string;
  last_names: string;
};

export type Order = {
  Order_id: string;
  store_id: Store;
  pickup_location: string;
  delivery_location: string;
};
export type Store = {
  store_id: string;
  name: string;
  address: string;
  town: string;
};
export type OrderItem = {
  id?: string;
  order_id: string;
  name: string;
  model: string;
  price: number;
  dimensions: string;
  weight: number;
};

type DirectusSchema = {
  order_info: OrderInfo[];
  Stores: Store[];
  Orders: Order[];
  Client: Client[];
  Order_items: OrderItem[];
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
              "Order_id",
              "pickup_location",
              "delivery_location",
              { store_id: ["name", "address", "town"] },
            ],
          },
          "order_total",
          "client_paid",
        ],
        filter: {
          _and: [
            {
              client_paid: {
                _eq: true,
              },
            },
            {
              routeId: {
                _null: true,
              },
            },
            {
              planId: {
                _null: true,
              },
            },
          ],
        },
      }),
    );
  }
  addRouteInfo(order_id: string, routeId: string, planId: string) {
    return this.client.request(
      updateItem("order_info", order_id, {
        routeId,
        planId,
      }),
    );
  }
  getOrderItems(order_id: string) {
    return this.client.request(
      readItems("Order_items", {
        fields: [
          "id",
          "order_id",
          "name",
          "model",
          "price",
          "dimensions",
          "weight",
        ],
        filter: {
          order_id: {
            _eq: order_id,
          },
        },
      }),
    );
  }
}
