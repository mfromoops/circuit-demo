import type { RestClient, StaticTokenClient } from "@directus/sdk";
import {
  createDirectus,
  createItem,
  readItem,
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
  id: string;
  name: string;
  last_names: string;
  email: string;
  phone_number: string;
};

export type Order = {
  Order_id: string;
  store_id: Store;
  pickup_location: string;
  delivery_location: string;
  signature_url: string;
  pictures_urls: string;
  order_status: string;
};
export type Store = {
  store_id: string;
  name: string;
  address: string;
  town: string;
  depot_id: string;
  zip_code: string;
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

export type DriverCompletedOrder = {
  id: string;
  orders: string;
  driver_email: string;
  circuit_driver_id: string;
  circuit_stop_id: string;
};

type DirectusSchema = {
  order_info: OrderInfo[];
  Stores: Store[];
  Orders: Order[];
  Client: Client[];
  Order_items: OrderItem[];
  driver_completed_orders: DriverCompletedOrder[];
};
export class DirectusClient {
  private client: RestClient<DirectusSchema> &
    StaticTokenClient<DirectusSchema>;
  constructor(private access_token: string) {
    this.client = createDirectus<DirectusSchema>("https://api.loadds.com")
      .with(rest())
      .with(staticToken(access_token));
  }
  getOrder(orderId: string) {
    return this.client.request(
      readItem("Orders", orderId, {
        fields: ["signature_url", "pictures_urls", "Order_id"],
      }),
    );
  }
  getStores() {
    return this.client.request(
      readItems("Stores", {
        fields: ["store_id", "name", "address", "town", "depot_id"],
      }),
    );
  }
  updateStore(store: Store) {
    return this.client.request(updateItem("Stores", store.store_id, store));
  }
  createStore(store: Store) {
    return this.client.request(createItem("Stores", store)).catch(() => {
      console.error({
        message: "Error creating store",
      });
      return {};
    });
  }
  getOrders() {
    return this.client.request(
      readItems("order_info", {
        fields: [
          "id",
          { client: ["name", "last_names", "id", "email", "phone_number"] },
          {
            order: [
              "Order_id",
              "pickup_location",
              "delivery_location",
              { store_id: ["name", "address", "town", "store_id", "depot_id"] },
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
  setSignatureAndPictures(
    orderId: string,
    signatureUrl: string,
    picturesUrls: string,
  ) {
    return this.client.request(
      updateItem("Orders", orderId, {
        signature_url: signatureUrl,
        pictures_urls: picturesUrls,
        order_status: "Completed",
      }),
    );
  }
  saveDriverOrder(
    orderId: string,
    driverEmail: string,
    circuitDriverId: string,
    circuitStopId: string,
  ) {
    return this.client.request(
      createItem("driver_completed_orders", {
        orders: orderId,
        driver_email: driverEmail,
        circuit_driver_id: circuitDriverId,
        circuit_stop_id: circuitStopId,
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
  findOrderByPlanId(planId: string) {
    return this.client.request(
      readItems("order_info", {
        fields: [
          "id",
          { client: ["name", "last_names", "id", "email", "phone_number"] },
          {
            order: [
              "Order_id",
              "pickup_location",
              "delivery_location",
              { store_id: ["name", "address", "town", "store_id", "depot_id"] },
            ],
          },
          "order_total",
          "client_paid",
        ],
        filter: {
          _and: [
            {
              planId: {
                _eq: planId,
              },
            },
          ],
        },
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
