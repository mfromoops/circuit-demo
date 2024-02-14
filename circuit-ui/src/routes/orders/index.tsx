import { component$ } from "@builder.io/qwik";
import { routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { DirectusClient } from "~/business-logic/utils/directus.utils";

export const useCreatePlan = routeAction$(async (data, { env, json }) => {

});

export const useOrders = routeLoader$(async (context) => {
    const directusToken = context.env.get("DIRECTUS_TOKEN");
    const access_token = context.env.get("DIRECTUS_TOKEN") as string;
    const directusClient = new DirectusClient(access_token);
    return await directusClient.getOrders();
    // const orders = await client.request(readItems('order_info'));
    // return orders

});
export default component$(() => {
    const orders = useOrders();
    return (
        <div class="mx-5 pb-5">

        <h1>Orders ({orders.value?.length})</h1>
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
                </div>
            )
        })}
        </div>
    );
})