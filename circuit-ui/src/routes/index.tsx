import { component$ } from "@builder.io/qwik";
import {
  Form,
  Link,
  routeAction$,
  routeLoader$,
  type DocumentHead
} from "@builder.io/qwik-city";
import { CircuitAPI } from "~/business-logic/utils";
import { TextField } from "~/components/ui/Fields";
import { Button, Card, CardHeading } from "~/components/ui/UIComponents";

export const useCircuit = routeLoader$(async ({ env }) => {
  const apiKey = env.get("CIRCUIT_API_KEY");
  const circuitsAPI = new CircuitAPI(apiKey as string);
  return (await circuitsAPI.listPlans()).plans;
});

export const useCreatePlan = routeAction$(async (data, { env, json }) => {
  const body = data as {name: string, date: string};
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
  return (
    <div>
      <div class="px-5">
      <h1 class="text-center text-lg">Circuit Plans</h1>
      </div>
      <div class="flex gap-5 px-5">
        <div class="grid flex-1 gap-2 mb-5">
          {plans.value &&
            plans.value.map((plan) => (
              <Link href={plan.id} key={plan.id} class="bg-white p-2 shadow-md">
                <h2>{plan.title}</h2>
                <p>{plan.id}</p>
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
              <Button type="submit" class="bg-green-500 outline">Create Plan</Button>
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
