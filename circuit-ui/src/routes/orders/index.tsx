import { component$ } from "@builder.io/qwik";
import { routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { CircuitAPI } from "~/business-logic/utils";
import { DirectusClient, OrderInfo } from "~/business-logic/utils/directus.utils";

export const useCreatePlan = routeAction$(async (data, { env, json }) => {
    const orders = data.orders as OrderInfo[];
    const circuit = new CircuitAPI(env.get("CIRCUIT_API_KEY") as string);
    const directus = new DirectusClient(env.get("DIRECTUS_TOKEN") as string);
    const today = new Date();
    const plan = await circuit.createPlan({
        title: `Plan ${today.toISOString()}`,
        starts: {
            day: today.getDate(),
            month: today.getMonth()+1,
            year: today.getFullYear(),
        }
    });
    for(let order of orders) {
        const items = await directus.getOrderItems(order.order.Order_id);
        const stop = await circuit.createStop({
            address: {
                addressLineOne: order.order.delivery_location,
            },
            orderInfo: {
                products: items.map(item => item.name+" "+item.model),
                sellerName: order.order.store_id.name,
                sellerOrderId: order.order.Order_id,
            },
            packageCount: items.length,
        }, plan.id);
        await directus.addRouteInfo(order.id, stop.id, plan.id);
    }
});

export const useOrders = routeLoader$(async (context) => {
    const access_token = context.env.get("DIRECTUS_TOKEN") as string;
    const directusClient = new DirectusClient(access_token);
    return await directusClient.getOrders();
    // const orders = await client.request(readItems('order_info'));
    // return orders

});
export default component$(() => {
    const orders = useOrders();
    const createPlan = useCreatePlan();
    return (
        <div class="mx-5 pb-5">
            <div class="flex justify-between">
                <h1>Orders ({orders.value?.length})</h1>
                <button onClick$={() => createPlan.submit({orders: orders.value})}>
                    Create Plan
                </button>
            </div>
        {orders.value.map(order => {
            return (
                <div key={order.id} class="border p-2 my-2">
                    <p>{order.client.name} {order.client.last_names}</p>
                    <p>{order.order.store_id.name}</p>
                    <p>{order.order_total}</p>
                    <p>{order.order.store_id.address}</p>
                    <p>
                        {order.order.store_id.town}
                    </p>
                    <p>
                        {order.client_paid ? "Paid" : "Not Paid"}
                    </p>
                    <p>
                        {order.order.delivery_location}
                    </p>
                    <p>
                        {order.planId ? "Assigned to Plan" : "Not Assigned to Plan"}
                    </p>
                    <p>
                        {order.routeId ? "Assigned to Route" : "Not Assigned to Route"}
                    </p>
                </div>
            )
        })}
        </div>
    );
})