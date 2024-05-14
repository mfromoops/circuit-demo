import { component$ } from "@builder.io/qwik";
import {
  Link,
  routeAction$,
  routeLoader$,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { StopObject } from "~/business-logic/types";
import { CircuitAPI } from "~/business-logic/utils";
import { Button } from "~/components/ui/UIComponents";

export const usePlan = routeLoader$(async ({ env, url }) => {
  const id = url.pathname.split("/")[2];
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const plan = await circuitsAPI.getPlan(`plans/${id}`);
  if (!plan) {
    return undefined;
  }
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
  if (plan === undefined) {
    throw new Error("Plan not found");
  }
  await circuitsAPI.distributePlan(`plans/${id}`);
  while (plan && !plan.distributed) {
    await new Promise((res) => setTimeout(res, 1500));
    plan = await circuitsAPI.getPlan(`plans/${id}`);
  }
  return plan;
});

export const useOptimizePlan = routeAction$(async (_, { env, url }) => {
  const id = url.pathname.split("/")[2];
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  let plan = await circuitsAPI.getPlan(`plans/${id}`);
  if (plan === undefined) {
    throw new Error("Plan not found");
  }
  await circuitsAPI.optimizePlan(`plans/${id}`);
  while (plan && plan.optimization === "creating") {
    await new Promise((res) => setTimeout(res, 1500));
    plan = await circuitsAPI.getPlan(`plans/${id}`);
  }
  return plan;
});

function getStyle(stop: StopObject) {
  const deliveryInfo = stop.deliveryInfo;
  const state = deliveryInfo.state;
  const attempted = deliveryInfo.attempted;
  if (attempted) {
    if (state.includes("delivered")) {
      return {
        backgroundColor: "green",
        color: "white",
      };
    } else {
      return {
        backgroundColor: "red",
        color: "white",
      };
    }
  } else {
    return {
      backgroundColor: "white",
      color: "black",
    };
  }
}
export default component$(() => {
  const plan = usePlan();
  if (!plan.value) {
    return (
      // container should take all the space left after the header
      <div class="absolute bottom-0 left-0 top-0 flex h-full w-full items-center justify-center">
        <div class="text-center">
          <h1 class="mb-5 text-3xl">Plan Not Found</h1>
          <Link href="/">
            <Button type="button" class="w-32 bg-gray-500">
              Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  const distributePlan = useDistributePlan();
  const optimizePlan = useOptimizePlan();
  return (
    <>
      <h1 class="w-full text-center text-lg">Circuit Stops</h1>
      <div class="mb-5 flex justify-between px-5">
        <Link href="/">
          <Button type="button" class="bg-gray-500">
            Back
          </Button>
        </Link>
        {plan.value.optimization === "creating" && (
          <div class="flex gap-2">
            <Link href={`add-stop`}>
              <Button type="button" class="bg-[#f99d1d]">
                Add Stop
              </Button>
            </Link>
            <Link href={`add-drivers`}>
              <Button type="button" class="bg-[#002547]">
                Manage Drivers
              </Button>
            </Link>
          </div>
        )}
      </div>
      <div class="grid gap-2 px-5">
        <div class="bg-white p-2 shadow-md">
          <h2>{plan.value.title}</h2>
          <p>
            {plan.value.drivers.length > 0
              ? plan.value.drivers.map((d) => d.email).join(", ")
              : "No Drivers Assigned"}
          </p>
          <p>{plan.value.optimization}</p>
          <p>{plan.value.distributed ? "Distributed" : "Not Distributed"}</p>
          {plan.value.optimization === "creating" && (
            <div class="flex gap-5">
              <Button
                class="bg-green-700"
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
          <div
            style={{
              ...getStyle(stop),
              padding: "10px",
              margin: "10px",
              boxShadow: "2px 2px 2px #ccc",
            }}
            key={stop.id}
          >
            <div class="flex justify-between">
              <h2 class="mb-2 text-lg">{stop.address.addressLineOne}</h2>
              <span>
                <span class="flex rounded-sm bg-gray-300 px-2 py-0 align-middle text-xs text-white">
                  {stop.type}
                </span>
              </span>
            </div>
            <h2>{stop.address.addressLineTwo}</h2>
            <h2>
              {stop.activity &&
                stop.activity.slice(0, 1).toUpperCase() +
                  stop.activity.slice(1)}
            </h2>
            <h2>
              {stop.deliveryInfo.attempted
                ? stop.deliveryInfo.state
                    .split("_")
                    .map((s) => {
                      return s.charAt(0).toUpperCase() + s.slice(1);
                    })
                    .join(" ") +
                  " at " +
                  new Date(
                    stop.deliveryInfo.attemptedAt! * 1000,
                  ).toLocaleString()
                : "Not Attempted"}
            </h2>
          </div>
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
