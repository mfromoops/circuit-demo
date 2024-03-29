import { component$, useSignal } from "@builder.io/qwik";
import { routeAction$, routeLoader$, useNavigate } from "@builder.io/qwik-city";
import { DriverObject } from "~/business-logic/types";
import { CircuitAPI } from "~/business-logic/utils";
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
  const circuitsAPI = new CircuitAPI(apiKey as string);
  return circuitsAPI.updatePlan(drivers, `plans/${planId}`);
  
});

export default component$(() => {
  const drivers = useListDrivers();
  const manageDrivers = useAddDrivers();
  const nav = useNavigate();
  const selectedDrivers = useSignal<DriverObject[]>(drivers.value.activeDrivers.drivers);
  return (
    <>
      <div class="flex m-5">
        <button
          onClick$={() => 
            nav(`/plans/${location.pathname.split("/")[2]}`)
          }

          class="rounded-md bg-gray-500 p-2 px-5 text-white"
        >
          Back
        </button>
      </div>
      <div class="grid grid-cols-2 gap-5 px-5">
        <div>
          Drivers Available
          {drivers.value &&
            drivers.value.drivers.drivers.map((driver) => (
              <div
                key={driver.id}
                class="my-2 grid bg-white p-5 shadow-md"
                
              >
                <div>{driver.name}</div>
                <div>{driver.email}</div>
                <div>{driver.phone}</div>
                <div>{driver.active ? "Active" : "Not Active"}</div>
                <Button class="bg-green-500 mt-4"
                onClick$={(e) => {
                  drivers.value.activeDrivers.drivers.push(driver);
                  drivers.value.drivers.drivers = drivers.value.drivers.drivers.filter(
                    (d) => d.id !== driver.id,
                  );
                  selectedDrivers.value.push(driver);
                  manageDrivers.submit({drivers: selectedDrivers.value.map(d => d.id as `drivers/${string}`)});
                }}>
                  Add Driver
                </Button>
              </div>
            ))}
        </div>

        <div>
          Selected Drivers
          {drivers.value &&
            drivers.value.activeDrivers.drivers.map((driver) => (
              <div key={driver.id} class="my-2 bg-white p-5 shadow-md grid"
              
              >
                <div>{driver.name}</div>
                <div>{driver.email}</div>
                <div>{driver.phone}</div>
                <div>{driver.active ? "Active" : "Not Active"}</div>
                <Button class="bg-red-500 mt-4"
                onClick$={() => {
                  drivers.value.drivers.drivers.push(driver);
                  drivers.value.activeDrivers.drivers = drivers.value.activeDrivers.drivers.filter(
                    (d) => d.id !== driver.id,
                  );
                  selectedDrivers.value = selectedDrivers.value.filter(
                    (d) => d.id !== driver.id,
                  );
                  manageDrivers.submit({drivers: selectedDrivers.value.map(d => d.id as `drivers/${string}`)});
                
                }}
                >
                  Remove Driver
                </Button>
              </div>
            ))}
        </div>
      </div>
    </>
  );
});
