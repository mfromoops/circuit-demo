import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  useLocation,
  useNavigate,
  type DocumentHead,
} from "@builder.io/qwik-city";
import { twMerge } from "tailwind-merge";
import { CircuitAPI } from "~/business-logic/utils";
import { TextField } from "~/components/ui/Fields";
import { Button, Card, CardHeading } from "~/components/ui/UIComponents";

export const useCircuit = routeLoader$(async ({ env, url }) => {
  const token = url.searchParams.get("token");
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const resp = await circuitsAPI.listPlans(token as string);
  let nextPageToken = resp.nextPageToken;
  while (nextPageToken) {
    const next = await circuitsAPI.listPlans(nextPageToken);
    resp.plans = resp.plans.concat(next.plans);
    nextPageToken = next.nextPageToken;
  }
  const plans = resp.plans.sort((a, b) => {
    const aDate = new Date(a.starts.year, a.starts.month, a.starts.day);
    const bDate = new Date(b.starts.year, b.starts.month, b.starts.day);
    return bDate.getTime() - aDate.getTime();
  });
  return { plans, nextPageToken };
});

export const useCreatePlan = routeAction$(async (data, { env, json }) => {
  const body = data as { name: string; date: string };
  const date = new Date(body.date);
  const starts = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  await circuitsAPI.createPlan({
    title: body.name,
    starts,
  });
  json(200, { message: "Plan created" });
});
export default component$(() => {
  const plans = useCircuit();
  const createPlan = useCreatePlan();
  const nav = useNavigate();
  const loc = useLocation();
  const navState = useSignal({
    canGoBack: loc.url.href.includes("?"),
    canGoForward: plans.value.nextPageToken,
  });
  const updateNavState = $(() => {
    navState.value = {
      canGoBack: loc.url.href.includes("?"),
      canGoForward: plans.value.nextPageToken,
    };
  });
  useTask$(({ track }) => {
    track(() => loc.url.href);
    updateNavState();
  });
  return (
    <div>
      <div class="flex gap-5 px-5">
        <div class="mb-5 grid flex-1 gap-2">
          <div class="flex justify-between px-5">
            <button
              class={twMerge(
                "h-10 rounded-md bg-blue-500 px-5 text-white shadow-md hover:shadow-lg",
                !navState.value.canGoBack
                  ? "pointer-events-none opacity-50 shadow-none"
                  : "",
              )}
              disabled={!navState.value.canGoBack}
              onClick$={() => {
                location.href.includes("?") && window.history.back();
              }}
            >
              Previous
            </button>
            <h1 class="text-center text-lg">Circuit Plans</h1>
            <button
              disabled={!navState.value.canGoForward}
              class={twMerge(
                "h-10 rounded-md bg-blue-500 px-5 text-white shadow-md hover:shadow-lg",
                !navState.value.canGoForward
                  ? "pointer-events-none opacity-50 shadow-none"
                  : "",
              )}
              onClick$={() => {
                nav("/?token=" + plans.value.nextPageToken);
              }}
            >
              Next
            </button>
          </div>
          {plans.value.plans.map((plan) => (
            <Link href={plan.id} key={plan.id} class="bg-white p-2 shadow-md">
              <h2>{plan.title}</h2>
              <p>
                {plan.starts.day}/{plan.starts.month}/{plan.starts.year}
              </p>
              <p>{plan.drivers.map((d) => d.email).join(", ")}</p>
            </Link>
          ))}
        </div>
        <div>
          <Card>
            <CardHeading>Add Plan</CardHeading>
            <Form action={createPlan} class="grid gap-2">
              <TextField inputName="name" label="Plan Name" />
              <input name="date" type="date" />
              <Button type="submit" class="bg-green-500 outline">
                Create Plan
              </Button>
            </Form>
          </Card>
        </div>
      </div>
    </div>
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
