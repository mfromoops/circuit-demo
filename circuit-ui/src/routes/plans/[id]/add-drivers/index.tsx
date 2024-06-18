import { component$, useSignal } from "@builder.io/qwik";
import { routeAction$, routeLoader$, useNavigate } from "@builder.io/qwik-city";
import type { DriverObject } from "~/business-logic/types";
import { CircuitAPI } from "~/business-logic/utils";
import { DirectusClient } from "~/business-logic/utils/directus.utils";
import { Button } from "~/components/ui/UIComponents";

export const useListDrivers = routeLoader$(async ({ env, url }) => {
  const planId = url.pathname.split("/")[2];
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const drivers = await circuitsAPI.listDrivers();
  const activeDrivers = await circuitsAPI.listPlanDrivers(`plans/${planId}`);
  drivers.drivers = drivers.drivers.filter(
    (driver) =>
      !activeDrivers.drivers.find(
        (activeDriver) => activeDriver.id === driver.id,
      ),
  );
  return { drivers, activeDrivers };
});

export const useAddDrivers = routeAction$(async (body, context) => {
  const { env } = context;
  const drivers = body.drivers as `drivers/${string}`[];
  const planId = context.url.pathname.split("/")[2];
  const apiKey = env.get("CIRCUIT_API_KEY");
  const access_token = env.get("DIRECTUS_TOKEN")!;
  const directusClient = new DirectusClient(access_token);
  const depot_id = await directusClient
    .findOrderByPlanId(`plans/${planId}`)
    .then((res) => {
      return res[0].order.store_id.depot_id;
    });
  const circuitsAPI = new CircuitAPI(apiKey as string);
  return circuitsAPI.updatePlan(drivers, `plans/${planId}`, depot_id);
});

export default component$(() => {
  const drivers = useListDrivers();
  const manageDrivers = useAddDrivers();
  const nav = useNavigate();
  const selectedDrivers = useSignal<DriverObject[]>(
    drivers.value.activeDrivers.drivers,
  );
  return (
    <>
      <div class="m-5 flex">
        <button
          onClick$={() => nav(`/plans/${location.pathname.split("/")[2]}`)}
          class="rounded-md bg-gray-500 p-2 px-5 text-white"
        >
          Back
        </button>
      </div>
      <div class="grid grid-cols-2 gap-5 px-5">
        <div>
          Drivers Available
          {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            drivers.value &&
              drivers.value.drivers.drivers.map((driver) => (
                <div key={driver.id} class="my-2 grid bg-white p-5 shadow-md">
                  <div>{driver.name}</div>
                  <div>{driver.email}</div>
                  <div>{driver.phone}</div>
                  <div>{driver.active ? "Active" : "Not Active"}</div>
                  <Button
                    class="mt-4 bg-[#f99d1d]"
                    onClick$={() => {
                      drivers.value.activeDrivers.drivers.push(driver);
                      drivers.value.drivers.drivers =
                        drivers.value.drivers.drivers.filter(
                          (d) => d.id !== driver.id,
                        );
                      selectedDrivers.value.push(driver);
                      manageDrivers.submit({
                        drivers: selectedDrivers.value.map(
                          (d) => d.id as `drivers/${string}`,
                        ),
                      });
                    }}
                  >
                    Add Driver
                  </Button>
                </div>
              ))
          }
        </div>

        <div>
          Selected Drivers
          {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            drivers.value &&
              drivers.value.activeDrivers.drivers.map((driver) => (
                <div key={driver.id} class="my-2 grid bg-white p-5 shadow-md">
                  <div>{driver.name}</div>
                  <div>{driver.email}</div>
                  <div>{driver.phone}</div>
                  <div>{driver.active ? "Active" : "Not Active"}</div>
                  <Button
                    class="mt-4 bg-red-500"
                    onClick$={() => {
                      drivers.value.drivers.drivers.push(driver);
                      drivers.value.activeDrivers.drivers =
                        drivers.value.activeDrivers.drivers.filter(
                          (d) => d.id !== driver.id,
                        );
                      selectedDrivers.value = selectedDrivers.value.filter(
                        (d) => d.id !== driver.id,
                      );
                      manageDrivers.submit({
                        drivers: selectedDrivers.value.map(
                          (d) => d.id as `drivers/${string}`,
                        ),
                      });
                    }}
                  >
                    Remove Driver
                  </Button>
                </div>
              ))
          }
        </div>
      </div>
    </>
  );
});
