import { component$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { Depot, SearchAddressResult } from "~/business-logic/types";
import { CircuitAPI } from "~/business-logic/utils";
import { DirectusClient, Store } from "~/business-logic/utils/directus.utils";

export const useStores = routeLoader$(async (context) => {
  const access_token = context.env.get("DIRECTUS_TOKEN") as string;
  const circuitToken = context.env.get("CIRCUIT_API_KEY") as string;
  const circuitClient = new CircuitAPI(circuitToken);
  const directusClient = new DirectusClient(access_token);
  const stores = (await directusClient.getStores()) as Store[];
  const { depots } = (await circuitClient.getDepots()) as { depots: Depot[] };
  return { stores, depots };
});

export const useSearch = routeAction$(async ({ query }, { env, url }) => {
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const plans = await circuitsAPI.searchAddress(query as string).catch(e => {
    console.error(e);
    return {
        suggestions: []
    };
  
  })
  return plans;
});

export const useUpdateStore = routeAction$(async (body, context) => {
  const store = body as Store;
  const access_token = context.env.get("DIRECTUS_TOKEN") as string;
  const directusClient = new DirectusClient(access_token);
  return directusClient.updateStore(store);
});

export const useCreateStore = routeAction$(async (body, context) => {
  const store = body as Store;
  const access_token = context.env.get("DIRECTUS_TOKEN") as string;
  const directusClient = new DirectusClient(access_token);
    directusClient.createStore(store);
});
export default component$(() => {
  const stores = useStores();
  const updateStore = useUpdateStore();
  const createStore = useCreateStore();
  const search = useSearch();
  let selectedAddress = useSignal<SearchAddressResult>();
  return (
    <div class="flex px-5">
      <div class="flex-[3]">
        {stores.value &&
          stores.value?.stores.map((store) => {
            return (
              <div class="m-5 rounded-lg bg-gray-100 p-5" key={store.store_id}>
                <div class="text-lg font-bold">{store.name}</div>
                <div>{store.address}</div>
                <div>{store.town}</div>
                <div class="grid">
                  <label>Match with a depot</label>
                  {
                    <select
                      value={store.depot_id}
                      class="rounded-lg border-2 border-gray-400 p-2"
                      onChange$={(e) => {
                        store.depot_id = (e.target as HTMLSelectElement).value;
                        updateStore.submit(store);
                      }}
                    >
                      <option value={""} disabled selected={!store.depot_id}>
                        {"Select One"}
                      </option>
                      ;
                      {stores.value.depots.map((depot) => {
                        return (
                          <option
                            key={depot.id}
                            value={depot.id}
                            selected={depot.id === store.depot_id}
                          >
                            {depot.name}
                          </option>
                        );
                      })}
                    </select>
                  }
                </div>
              </div>
            );
          })}
      </div>
      <div class="flex-1">
        <div class="m-5 rounded-lg bg-gray-100 p-5">
          <h2>Add a new Store</h2>
          {selectedAddress.value ? (
            <div class="grid gap-2">
              <div>{selectedAddress.value.addressLineOne}</div>
              <div>{selectedAddress.value.addressLineTwo}</div>
              <button
                class="rounded-md bg-blue-500 p-2 text-white"
                onClick$={() => {
                    if(!selectedAddress.value) return;
                    const tmpStore: Omit<Store, "store_id"> = {
                        name: selectedAddress.value.addressLineOne,
                        address: selectedAddress.value.addressLineOne,
                        town: selectedAddress.value.addressLineTwo,
                        zip_code: "00794",
                        depot_id: "",
                    };
                    createStore.submit(tmpStore).then(a => {
                        selectedAddress.value = undefined;
                        search.submit({ query: ""});
                    })
                }}
              >
                Add Store
              </button>
              <button
                class="rounded-md bg-gray-500 p-2 text-white"
                onClick$={() => {
                    selectedAddress.value = undefined;
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <Form action={search} class="grid gap-2">
                <input class="rounded-md border p-2" type="text" name="query" />
                <button
                  class="rounded-md bg-blue-500 p-2 text-white"
                  type="submit"
                >
                  Search
                </button>
              </Form>
              {search.value && search.value.suggestions &&
                search.value.suggestions.map((sug: any) => (
                  <div
                    key={sug.placeId}
                    class="mx-5 mt-5 rounded-md bg-white p-5 shadow-md"
                    onClick$={() => {
                      selectedAddress.value = sug;
                    }}
                  >
                    <p>{sug.addressLineOne}</p>
                    <p>{sug.addressLineTwo}</p>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
});
