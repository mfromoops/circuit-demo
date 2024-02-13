import { $, component$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { Address, UserAddress, UserModel } from "~/business-logic/types";
import { TextField } from "~/components/ui/Fields";
import { Button, Card, CardHeading } from "~/components/ui/UIComponents";

export const useUser = routeLoader$(async ({ env, url }) => {
  const id = url.pathname.split("/")[2];
  return await fetch(`http://localhost:3005/users/${id}`)
    .then((res) => res.json())
    .then((user) => {
      console.log(user);
      return user as { user: UserModel; addresses: UserAddress[] };
    });
});

export const useAddAddress = routeAction$(async (data, { env, url }) => {
  const id = url.pathname.split("/")[2];
  const body = data as Address;
  await fetch(`http://localhost:3005/users/${id}/address`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
});
export default component$(() => {
  const user = useUser();
  const showAddForm = useSignal(false);
  const toggleForm = $(() => (showAddForm.value = !showAddForm.value));
  return (
    <>
      <div class="mx-5">
        {showAddForm.value ? (
          <AddAddressForm hide={toggleForm} />
        ) : (
          <>
            <div class="text-center">
              <h1>{user.value.user.name}</h1>
              <p>{user.value.user.email}</p>
            </div>
            <div class="mb-5 flex justify-between">
              <h2>Addresses</h2>
              <Button class="bg-green-500" onClick$={toggleForm}>
                Add
              </Button>
            </div>
            <ul class="grid grid-cols-3 gap-3">
              {user.value.addresses.map((address) => (
                <li key={address.id} class="h-full">
                  <Card class="h-full">
                    <p>{address.addressLineOne}</p>
                    <p>{address.addressLineTwo}</p>
                    {address.latitute && address.longitude && (
                      <p>
                        {address.latitute}, {address.longitude}
                      </p>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
});

export const AddAddressForm = component$((props: { hide: () => void }) => {
  const addAddress = useAddAddress();
  return (
    <Card>
      <CardHeading>Add Address</CardHeading>
      <Form class="grid gap-2" action={addAddress}>
        <TextField inputName="addressLineOne" label="Address Line 1" />
        <TextField inputName="addressLineTwo" label="Address Line 2" />
        <TextField inputName="latitute" label="Latitute" />
        <TextField inputName="longitude" label="Longitude" />
        <Button type="submit" class="bg-green-500">
          Add
        </Button>
        <Button class="bg-gray-300 text-gray-800" onClick$={props.hide}>
          Cancel
        </Button>
      </Form>
    </Card>
  );
});
