import { component$ } from "@builder.io/qwik";
import {
  routeLoader$,
  type DocumentHead,
  routeAction$,
  Form,
  Link,
} from "@builder.io/qwik-city";
import { CircuitAPI } from "~/business-logic/utils";
import { Button } from "~/components/ui/UIComponents";

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

export const useAddStop = routeAction$(async (body, { env, url }) => {
  const { addressLineOne, addressLineTwo } = body as {
    addressLineOne: string;
    addressLineTwo: string;
  };
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const planId = url.pathname.split("/")[2];
  try {
    const plan = await circuitsAPI.createStop(
      { address: { addressLineOne, addressLineTwo } },
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
  const search = useSearch();
  const addStop = useAddStop();

  return (
    <>
      <div class="mb-5 flex justify-between px-5">
        <Button type="button" class="bg-gray-500">
          <Link href="/">Back</Link>
        </Button>
        <h1 class="text-center text-lg">Circuit Stops</h1>
        <div class="flex gap-2">
          <Link href={`add-stop`}>
            <Button type="button" class="bg-green-500">
              Add Stop
            </Button>
          </Link>
          <Link href={`add-drivers`}>
            <Button type="button" class="bg-blue-500">
              Add Drivers
            </Button>
          </Link>
        </div>
      </div>
      <div class="grid gap-2 px-5">
        <div class="bg-white p-2 shadow-md">
          <h2>{plan.value.title}</h2>
          <p>{plan.value.id}</p>
          <p>{plan.value.drivers.map((d) => d.email).join(", ")}</p>
          <p>{plan.value.routes.map((r) => `${r.title}-${r.stopCount}`)}</p>
          <p>{plan.value.stops.length} Stops</p>
        </div>
        <h1 class="text-center text-lg">Stops</h1>
        {plan.value.stops.map((stop) => (
          <a
            href={stop.webAppLink}
            target="_blank"
            class="bg-white p-2 shadow-md"
            key={stop.id}
          >
            <div class="flex justify-between">
              <h2>{stop.address.addressLineOne}</h2>
              <span>
                <span class="flex rounded-sm bg-gray-300 px-2 py-0 align-middle text-xs text-white">
                  {stop.type}
                </span>
              </span>
            </div>
            <h2>{stop.address.addressLineTwo}</h2>
            {/* <h2>{stop.title}</h2> */}
            {/* <p>{stop.address}</p> */}
            {/* <p>{stop.lat}, {stop.lng}</p> */}
          </a>
        ))}
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
