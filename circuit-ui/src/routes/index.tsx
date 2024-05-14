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
import { type PlanObject } from "~/business-logic/types";
import { CircuitAPI } from "~/business-logic/utils";
import { TextField } from "~/components/ui/Fields";
import { Button, Card, CardHeading } from "~/components/ui/UIComponents";

export const useCircuit = routeLoader$(async ({ env, url }) => {
  const token = url.searchParams.get("token");
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  const resp = await circuitsAPI.listPlans(token as string);
  if (resp.plans === undefined || resp.plans === null) {
    resp.plans = [];
  }
  let nextPageToken = resp.nextPageToken;
  while (nextPageToken) {
    const next = await circuitsAPI.listPlans(nextPageToken);
    if (next.plans === undefined || next.plans === null) {
      next.plans = [];
    }
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

export const useDeleteAllPlans = routeAction$(async (body, { env, json }) => {
  const plansStr = body.plans as string;
  const allPlans = JSON.parse(plansStr) as PlanObject[];
  console.log({ allPlans });
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  for (const plan of allPlans) {
    await circuitsAPI.deletePlan(plan.id as `plans/${string}`);
  }
  json(200, { message: "Plans deleted" });
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
  const deleteAllPlans = useDeleteAllPlans();
  return (
    <div>
      <div>
        {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          false && (
            <button
              onClick$={() => {
                const formData = new FormData();
                formData.append("plans", JSON.stringify(plans.value.plans));
                deleteAllPlans.submit(formData);
              }}
            >
              Delete All Plans
            </button>
          )
        }
      </div>
      <div class="flex gap-5 px-5">
        <div class="mb-5 grid flex-1 gap-2">
          <div class="mb-5 flex justify-between">
            <Button
              class={twMerge(
                "w-32 bg-[#f99d1d]",
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
            </Button>
            <h1 class="text-center text-lg">Circuit Plans</h1>
            <Button
              disabled={!navState.value.canGoForward}
              class={twMerge(
                "w-32 bg-[#f99d1d]",
                !navState.value.canGoForward
                  ? "pointer-events-none opacity-50 shadow-none"
                  : "",
              )}
              onClick$={() => {
                nav("/?token=" + plans.value.nextPageToken);
              }}
            >
              Next
            </Button>
          </div>
          {plans.value.plans.length === 0 ? (
            <Card>
              <CardHeading>No Plans</CardHeading>
              No Plans are available at this time
            </Card>
          ) : (
            plans.value.plans.map((plan) => (
              <Link href={plan.id} key={plan.id}>
                <Card>
                  <CardHeading>{plan.title}</CardHeading>
                  <p>
                    Planned for {plan.starts.day}/{plan.starts.month}/
                    {plan.starts.year}
                  </p>
                  <p>
                    {plan.optimization.slice(0, 1).toUpperCase() +
                      plan.optimization.slice(1)}
                  </p>
                  <p>{plan.distributed ? "Distributed" : "Not Distributed"}</p>
                  {plan.drivers.length > 0 ? (
                    <p>
                      Assigned Drivers{" "}
                      {plan.drivers.map((d) => d.email).join(", ")}
                    </p>
                  ) : (
                    <p>No Drivers Assigned</p>
                  )}
                </Card>
              </Link>
            ))
          )}
        </div>
        <div>
          <Card>
            <CardHeading>Add Plan</CardHeading>
            <Form action={createPlan} class="grid gap-2">
              <TextField inputName="name" label="Plan Name" />
              <input name="date" type="date" />
              <Button type="submit" class="bg-[#f99d1d] outline">
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
