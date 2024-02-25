import {
  $,
  Signal,
  component$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  useNavigate,
  useLocation,
} from "@builder.io/qwik-city";
import { twMerge } from "tailwind-merge";
import { CircuitAPI } from "~/business-logic/utils";
import { TextField } from "~/components/ui/Fields";
import { Button, Card, CardHeading } from "~/components/ui/UIComponents";

type UsePlanType = ReturnType<typeof usePlan>;

export const usePlan = routeLoader$(async ({ env, url }) => {
  const id = url.pathname.split("/")[2];
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const plan = await circuitsAPI.getPlan(`plans/${id}`);
  const routes = Promise.all(
    plan.routes.map((route) => circuitsAPI.getRoute(route)),
  );
  const stops = await circuitsAPI.listStops(`plans/${id}`);
  const newPlan = { ...plan, routes: await routes, stops: stops.stops };
  return newPlan;
});

export const useSearch = routeAction$(async ({ query }, { env, url }) => {
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const plans = await circuitsAPI.searchAddress(query as string);
  return plans;
});

export const useAddByCoordinates = routeAction$(async (body, { env, url }) => {
  const { latitude, longitude } = body as { latitude: string; longitude: string };
  const address = {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  }
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const planId = url.pathname.split("/")[2];
  try {
    const plan = await circuitsAPI.createStop(
      {
        address,
        orderInfo: {
          products: ["product1", "product2"],
          sellerName: "seller",
          sellerOrderId: "order",
        },
        recipient: {
          name: "name",
          email: "email",
        },
        packageCount: 1,
        activity: "delivery",
        notes: "note",
      },
      `plans/${planId}`,
    );
    return plan;
  } catch (e) {
    console.error(e);
    return null;
  }
});

export const useAddStop = routeAction$(async (body, { env, url }) => {
  const stopBody = body as {
    addressLineOne: string;
    addressLineTwo: string;
    latitute?: string;
    longitude?: string;
    recipient?: {
      name: string;
      email: string;
    }
  };
  
  const { addressLineOne, addressLineTwo,  recipient } = stopBody;
  const latitude = stopBody.latitute ? parseFloat(stopBody.latitute) : undefined;
  const longitude = stopBody.longitude ? parseFloat(stopBody.longitude) : undefined;
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const planId = url.pathname.split("/")[2];
  const address = latitude && longitude ? {latitude, longitude} : {addressLineOne, addressLineTwo}
  try {
    const plan = await circuitsAPI.createStop(
      {
        address,
        orderInfo: {
          products: ["product1", "product2"],
          sellerName: "seller",
          sellerOrderId: "order",
        },
        recipient,
        packageCount: 1,
        activity: "delivery",
        notes: "note",
      },
      `plans/${planId}`,
    );
    return plan;
  } catch (e) {
    console.error(e);
    return null;
  }
});

export default component$(() => {
  const plan = usePlan();
  const activeTab: Signal<"search" | "coordinates"> =
    useSignal("search");
  return (
    <>
      <Tabs acitveTab={activeTab}></Tabs>
      {activeTab.value === "search" && <SearchForm plan={plan}></SearchForm>}
      {activeTab.value === "coordinates" && <Coordinates></Coordinates>}
    </>
  );
});

const SearchForm = component$((props: { plan: UsePlanType }) => {
  const search = useSearch();
  const addStop = useAddStop();
  const nav = useNavigate();
  return !addStop.isRunning ? (
    <>
      <Form action={search} class="mx-5 mt-5 grid rounded-md p-5 shadow-md">
        <input type="text" name="query" class="border" />
        <button type="submit">Search</button>
      </Form>
      {search.value &&
        search.value.suggestions.map((sug: any) => (
          <div
            key={sug.placeId}
            class="mx-5 mt-5 p-5 shadow-md"
            onClick$={() => {
              addStop
                .submit({
                  addressLineOne: sug.addressLineOne,
                  addressLineTwo: sug.addressLineTwo,
                })
                .then((res) => {
                  nav("/" + props.plan.value.id);
                });
            }}
          >
            <p>{sug.addressLineOne}</p>
            <p>{sug.addressLineTwo}</p>
          </div>
        ))}
    </>
  ) : (
    <div class="mx-auto mt-5 w-72 text-center">
      <Card>
        <CardHeading>Adding Stop</CardHeading>
      </Card>
    </div>
  );
});

export const Tabs = component$(
  (props: { acitveTab: Signal<"search"  | "coordinates"> }) => {
    return (
      <div class="mx-auto w-2/3">
        <div class="relative right-0">
          <ul
            class={
              "relative flex list-none flex-wrap rounded-xl bg-blue-gray-50/60 p-1"
            }
            data-tabs="tabs"
            role="list"
          >
            <li
              onClick$={() => (props.acitveTab.value = "search")}
              class={twMerge([
                "z-30 flex-auto select-none text-center",
                props.acitveTab.value === "search"
                  ? "rounded-full bg-black text-white"
                  : "",
              ])}
            >
              <a
                href="#search"
                class="text-slate-700 z-30 mb-0 flex w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-inherit px-0 py-1"
                data-tab-target=""
                role="tab"
                aria-selected="true"
              >
                <span class="ml-1">Search</span>
              </a>
            </li>
            <li
              class={twMerge([
                "z-30 flex-auto select-none text-center",
                props.acitveTab.value === "coordinates"
                  ? "rounded-full bg-black text-white"
                  : "",
              ])}
              onClick$={() => (props.acitveTab.value = "coordinates")}
            >
              <a
                href="#coordinates"
                class="text-slate-700 z-30 mb-0 flex w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-inherit px-0 py-1"
                data-tab-target=""
                role="tab"
                aria-selected="false"
              >
                <span class="ml-1">Coordinates</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  },
);


export const Coordinates = component$(() => {
  const addByCoordinates = useAddByCoordinates();
  return (
    <div class="mt-5">
      <div class="mx-5 p-5 shadow-md">
        <Form class="grid gap-2" action={addByCoordinates}>
          <TextField label="Latitude" inputName="latitude" />
          <TextField label="Longitude" inputName="longitude" />
          <Button type="submit" class="bg-green-500">
            Search
          </Button>
        </Form>
      </div>
    </div>
  );
});
