import { component$ } from "@builder.io/qwik";
import {
  Link,
  routeAction$,
  routeLoader$,
  type DocumentHead,
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

export const useDistributePlan = routeAction$(async (_, { env, url }) => {
  const id = url.pathname.split("/")[2];
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  let plan = await circuitsAPI.getPlan(`plans/${id}`);
  await circuitsAPI.distributePlan(`plans/${id}`);
  while (!plan.distributed) {
    await new Promise((res) => setTimeout(res, 1500));
    plan = await circuitsAPI.getPlan(`plans/${id}`);
  }
  return plan;
});

export const useOptimizePlan = routeAction$(async (_, { env, url }) => {
  const id = url.pathname.split("/")[2];
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  await circuitsAPI.optimizePlan(`plans/${id}`);
  let plan = await circuitsAPI.getPlan(`plans/${id}`);
  while (plan.optimization === "creating") {
    await new Promise((res) => setTimeout(res, 1500));
    plan = await circuitsAPI.getPlan(`plans/${id}`);
  }
  return plan;
});

export default component$(() => {
  const plan = usePlan();
  const distributePlan = useDistributePlan();
  const optimizePlan = useOptimizePlan();
  return (
    <>
      <h1 class="w-full border text-center text-lg">Circuit Stops</h1>
      <div class="mb-5 flex justify-between px-5">
        <Link href="/">
          <Button type="button" class="bg-gray-500">
            Back
          </Button>
        </Link>
        {plan.value.optimization === "creating" && (
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
        )}
      </div>
      <div class="grid gap-2 px-5">
        <div class="bg-white p-2 shadow-md">
          <h2>{plan.value.title}</h2>
          <p>{plan.value.drivers.map((d) => d.email).join(", ")}</p>
          <p>{plan.value.optimization}</p>
          <p>{plan.value.distributed ? "Distributed" : "Not Distributed"}</p>
          {plan.value.optimization === "creating" && (
            <div class="flex gap-5">
              <Button
                class="bg-green-500"
                onClick$={() => {
                  optimizePlan.submit({ ...plan.value }).then(() => {
                    distributePlan.submit({ ...plan.value });
                  });
                }}
              >
                Start Route
              </Button>
            </div>
          )}
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
