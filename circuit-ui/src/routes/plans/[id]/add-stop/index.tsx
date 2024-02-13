import { $, Signal, component$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import {
  routeLoader$,
  routeAction$,
  Form,
  useNavigate,
  useLocation,
} from "@builder.io/qwik-city";
import { twMerge } from "tailwind-merge";
import { CircuitAPI } from "~/business-logic/utils";
import { Card, CardHeading } from "~/components/ui/UIComponents";
import { useUserList } from "~/routes/layout";

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

type UsePlanType = ReturnType<typeof usePlan>;

export default component$(() => {
  const plan = usePlan();
  const userList = useUserList();
  const activeTab: Signal<"search" | "user" | "coordinates"> =
    useSignal("search");
  return (
    <>
      <Tabs acitveTab={activeTab}></Tabs>
      <SearchForm plan={plan} />
    </>
  ) 
});

const SearchForm = component$((props: {plan: UsePlanType}) => {
  const search = useSearch();
  const addStop = useAddStop();
  const nav = useNavigate();
  return !addStop.isRunning ? (<>
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
  </>) : (
    <div class="mx-auto w-72 text-center mt-5">
      <Card>
        <CardHeading>Adding Stop</CardHeading>
      </Card>
    </div>
  );
});

export const Tabs = component$(
  (props: { acitveTab: Signal<"search" | "user" | "coordinates"> }) => {
    return (
      <div class="mx-auto w-2/3">
        <div class="relative right-0">
          <ul
            class={
              "bg-blue-gray-50/60 relative flex list-none flex-wrap rounded-xl p-1"
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
                  : ""
              ])}
            >
              <a
                href="#search"
                class="z-30 mb-0 flex w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-inherit px-0 py-1 text-slate-700"
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
                props.acitveTab.value === "user"
                  ? "rounded-full bg-black text-white"
                  : ""
              ])}
              onClick$={() => (props.acitveTab.value = "user")}
            >
              <a
                href="#user"
                class="z-30 mb-0 flex w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-inherit px-0 py-1 text-slate-700"
                data-tab-target=""
                role="tab"
                aria-selected="false"
              >
                <span class="ml-1">Users</span>
              </a>
            </li>
            <li
              class={twMerge([
                "z-30 flex-auto select-none text-center",
                props.acitveTab.value === "coordinates"
                  ? "rounded-full bg-black text-white"
                  : ""
              ])}
              onClick$={() => (props.acitveTab.value = "coordinates")}
            >
              <a
                href="#coordinates"
                class="z-30 mb-0 flex w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-inherit px-0 py-1 text-slate-700"
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
