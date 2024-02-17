import { component$ } from "@builder.io/qwik";
import { routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { CircuitAPI } from "~/business-logic/utils";
import {
  DirectusClient,
  OrderInfo,
} from "~/business-logic/utils/directus.utils";

export const useCreatePlan = routeAction$(async (data, { env, json }) => {
  const orders = data.orders as [string, OrderInfo[]][];

  for (let key in orders) {
    const tmpOrder = orders[key][1];
    const name = tmpOrder[0].order.store_id.name;
    const circuit = new CircuitAPI(env.get("CIRCUIT_API_KEY") as string);
    const directus = new DirectusClient(env.get("DIRECTUS_TOKEN") as string);

    const today = new Date();
    const plan = await circuit.createPlan({
      title: `${name}`,
      starts: {
        day: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      },
    });

    for (let order of orders[key][1]) {
      const items = await directus.getOrderItems(order.order.Order_id);
      const stop = await circuit.createStop(
        {
          address: {
            addressLineOne: order.order.delivery_location,
          },
          recipient: {
            name: order.client.name + " " + order.client.last_names,
            phone: order.client.phone_number,
            externalId: order.client.id,
            email: order.client.email,
          },
          orderInfo: {
            products: items.map((item) => item.name + " " + item.model),
            sellerName: order.order.store_id.name,
            sellerOrderId: order.order.Order_id,
          },
          packageCount: items.length,
        },
        plan.id,
      );
      await directus.addRouteInfo(order.id, stop.id, plan.id);
    }
  }
});

export const useOrders = routeLoader$(async (context) => {
  const access_token = context.env.get("DIRECTUS_TOKEN") as string;
  const directusClient = new DirectusClient(access_token);
  const orders = await directusClient.getOrders();
  const map = new Map<string, OrderInfo[]>();
  for (let order of orders) {
    if (map.has(order.order.store_id.store_id)) {
      const orderInfo = map.get(order.order.store_id.store_id);
      orderInfo?.push(order);
    } else {
      map.set(order.order.store_id.store_id, [order]);
    }
  }
  return map;
  // const orders = await client.request(readItems('order_info'));
  // return orders
});


export default component$(() => {
  const stores = useOrders();
  const createPlan = useCreatePlan();
  return (
    <div class="mx-5 pb-5">
      <div class="flex justify-between">
        <h1>Orders</h1>
        <button
          onClick$={() =>
            createPlan.submit({ orders: Array.from(stores.value) })
          }
        >
          Create Plan
        </button>
      </div>
      {Array.from(stores.value.keys()).map((key) => {
        const order = stores.value.get(key)![0];
        const storeOrders = stores.value.get(key);
        return (
          <>
            <h1 class="my-5 text-xl">{order.order.store_id.name}</h1>
            <h3>{order.order.store_id.address}</h3>
            {storeOrders?.map((order) => (
              <div key={order.id} class="my-2 rounded-md border p-2 shadow-md">
                <p>
                  {order.client.name} {order.client.last_names}
                </p>
                <p>{order.order.store_id.name}</p>
                <p>{order.order_total}</p>
                <p>{order.order.store_id.address}</p>
                <p>{order.order.store_id.town}</p>
                <p>{order.client_paid ? "Paid" : "Not Paid"}</p>
                <p>{order.order.delivery_location}</p>
                <p>
                  {order.planId ? "Assigned to Plan" : "Not Assigned to Plan"}
                </p>
                <p>
                  {order.routeId
                    ? "Assigned to Route"
                    : "Not Assigned to Route"}
                </p>
              </div>
            ))}
          </>
        );
      })}
    </div>
  );
});
