import { component$ } from "@builder.io/qwik";
import { routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { Depot } from "~/business-logic/types";
import { CircuitAPI } from "~/business-logic/utils";
import { DirectusClient, Store } from "~/business-logic/utils/directus.utils";

export const useStores = routeLoader$(async (context) => {
  const access_token = context.env.get("DIRECTUS_TOKEN") as string;
  const circuitToken = context.env.get("CIRCUIT_API_KEY") as string;
  const circuitClient = new CircuitAPI(circuitToken);
  const directusClient = new DirectusClient(access_token);
  const stores = (await directusClient.getStores()) as Store[];
  const {depots} = await circuitClient.getDepots() as {depots: Depot[]};
  return { stores, depots };
});

export const useUpdateStore = routeAction$(async (body, context) => {
    const store = body as Store;
    const access_token = context.env.get("DIRECTUS_TOKEN") as string;
    const directusClient = new DirectusClient(access_token);
    return directusClient.updateStore(store);

});
export default component$(() => {
  const stores = useStores();
  const updateStore = useUpdateStore();
  return (
    <div class="px-5">
      Set a store here
      {stores.value && stores.value?.stores.map((store) => {
        return (
          <div class="m-5 rounded-lg bg-gray-100 p-5" key={store.store_id}>
            <div class="text-lg font-bold">{store.name}</div>
            <div>{store.address}</div>
            <div>{store.town}</div>
            <div class="grid">
                <label>
                Match with a depot
                </label>
            {<select
                value={store.depot_id}
                class="border-2 border-gray-400 rounded-lg p-2"
                onChange$={(e) => {

                    store.depot_id = (e.target as HTMLSelectElement).value;
                    updateStore.submit(store);
                }}
            >
                <option value={""} disabled selected={!store.depot_id}>{"Select One"}</option>;
              {stores.value.depots.map((depot) => {
                return <option key={depot.id} value={depot.id} selected={depot.id === store.depot_id}>
                    {depot.name}
                    </option>;
              })}
            </select>}
            </div>
          </div>
        );
      })}
    </div>
  );
});
