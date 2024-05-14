import { component$, useSignal } from "@builder.io/qwik";
import { routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { CircuitAPI } from "~/business-logic/utils";
import type { OrderInfo } from "~/business-logic/utils/directus.utils";
import { DirectusClient } from "~/business-logic/utils/directus.utils";
import { Button, Card, CardHeading } from "~/components/ui/UIComponents";

export const useCreatePlan = routeAction$(async (data, { env }) => {
  const orders = data.orders as [string, OrderInfo[]][];
  for (const key in orders) {
    let products: string[] = [];
    const tmpOrder = orders[key][1];
    const name = tmpOrder[0].order.store_id.name;
    const depot = tmpOrder[0].order.store_id.depot_id;
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
      depot,
    });

    for (const order of orders[key][1]) {
      const items = await directus.getOrderItems(order.order.Order_id);
      products = products.concat(
        items.map((item) => item.name + " " + item.model),
      );
      const stop = await circuit.createStop(
        {
          address: {
            addressLineOne: order.order.delivery_location,
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
    await circuit.createStop(
      {
        address: {
          addressLineOne: tmpOrder[0].order.store_id.town,
        },
        activity: "pickup",
        optimizationOrder: "first",
        orderInfo: {
          products,
          sellerName: tmpOrder[0].order.store_id.name,
          sellerOrderId: tmpOrder[0].order.Order_id,
        },
      },
      plan.id,
    );
  }
});

export const useOrders = routeLoader$(async (context) => {
  const access_token = context.env.get("DIRECTUS_TOKEN") as string;
  const directusClient = new DirectusClient(access_token);
  const orders = await directusClient.getOrders();
  console.log({ orders });
  const map = new Map<string, OrderInfo[]>();
  for (const order of orders) {
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
  const isCreating = useSignal(false);
  const stores = useOrders();
  const createPlan = useCreatePlan();
  return (
    <div class="mx-5 pb-5">
      <div class="flex justify-between">
        <h1>Orders</h1>
        {stores.value.size > 0 && (
          <Button
            class="bg-[#f99d1d]"
            disabled={isCreating.value}
            onClick$={() =>
              createPlan.submit({ orders: Array.from(stores.value) })
            }
          >
            {isCreating.value ? "Creating Plan" : "Create Plan"}
          </Button>
        )}
      </div>
      {stores.value.size === 0 ? (
        <Card class="mt-5">
          <CardHeading>No Orders</CardHeading>
          No Orders are available at this time
        </Card>
      ) : (
        Array.from(stores.value.keys()).map((key) => {
          const order = stores.value.get(key)![0];
          const storeOrders = stores.value.get(key);
          return (
            <>
              <h1 class="mb-2 text-xl">{order.order.store_id.name}</h1>

              {storeOrders?.map((order) => (
                <Card key={order.id}>
                  <CardHeading>
                    {order.client.name} {order.client.last_names}
                  </CardHeading>
                  <div class="flex flex-col gap-2">
                    <div>
                      <h3 class=" text-sm font-normal tracking-wide text-gray-500">
                        Location
                      </h3>
                      <p>{order.order.delivery_location}</p>
                    </div>
                    <div>
                      <h3 class=" text-sm font-normal tracking-wide text-gray-500">
                        Order Status
                      </h3>
                      <p>
                        {order.planId
                          ? "Assigned to Plan"
                          : "Not Assigned to Plan"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          );
        })
      )}
    </div>
  );
});
