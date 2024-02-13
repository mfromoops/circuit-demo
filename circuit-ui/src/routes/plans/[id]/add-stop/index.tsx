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
import { useUserList } from "~/routes/layout";

type UsePlanType = ReturnType<typeof usePlan>;
type UserUsersListType = ReturnType<typeof useUserList>;

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
  const { addressLineOne, addressLineTwo, recipient } = body as {
    addressLineOne: string;
    addressLineTwo: string;
    recipient?: {
      name: string;
      email: string;
    }
  };
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const planId = url.pathname.split("/")[2];
  try {
    const plan = await circuitsAPI.createStop(
      {
        address: { addressLineOne, addressLineTwo },
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
  const users = useUserList();
  const activeTab: Signal<"search" | "user" | "coordinates"> =
    useSignal("coordinates");
  return (
    <>
      <Tabs acitveTab={activeTab}></Tabs>
      {activeTab.value === "search" && <SearchForm plan={plan}></SearchForm>}
      {activeTab.value === "user" && <Users users={users}></Users>}
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
  (props: { acitveTab: Signal<"search" | "user" | "coordinates"> }) => {
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
                props.acitveTab.value === "user"
                  ? "rounded-full bg-black text-white"
                  : "",
              ])}
              onClick$={() => (props.acitveTab.value = "user")}
            >
              <a
                href="#user"
                class="text-slate-700 z-30 mb-0 flex w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-inherit px-0 py-1"
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

export const Users = component$((props: { users: UserUsersListType }) => {
  const addStop = useAddStop();
  const nav = useNavigate();
  const plan = usePlan();
  return (
    <ul
      class={"mx-5 mt-5 flex list-none flex-col flex-wrap gap-2 rounded-xl p-1"}
      data-tabs="tabs"
      role="list"
    >
      {props.users.value.map((user) => (
        <li
          class="z-30 flex-auto select-none bg-blue-gray-50/60 text-center"
          onClick$={() => {
            addStop
              .submit({
                addressLineOne: user.addressLineOne,
                addressLineTwo: user.addressLineTwo,
                recipient: {
                  name: user.name,
                  email: user.email,
                }
              })
              .then((res) => {
                nav("/" + plan.value.id);
              });
          }}
        >
          <a
            href="#search"
            class="text-slate-700 z-30 mb-0 flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-0 bg-inherit px-0 py-1"
            data-tab-target=""
            role="tab"
            aria-selected="true"
          >
            <div class="ml-1">{user.name}</div>
            <div class="ml-1">{user.email}</div>
            <div class="ml-1">{user.addressLineOne}</div>
            <div class="ml-1">{user.addressLineTwo}</div>
          </a>
        </li>
      ))}
    </ul>
  );
});

export const Coordinates = component$(() => {
  return (
    <div class="mt-5">
      <div class="mx-5 p-5 shadow-md">
        <Form class="grid gap-2">
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
