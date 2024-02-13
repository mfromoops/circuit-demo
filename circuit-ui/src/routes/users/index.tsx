import { component$ } from "@builder.io/qwik";
import { Form, routeAction$, routeLoader$ } from "@builder.io/qwik-city";
import { UserModel } from "~/business-logic/types";
import { TextField } from "~/components/ui/Fields";
import { Button, Card, CardHeading } from "~/components/ui/UIComponents";
import { useUserList } from "../layout";


export const useCreateUser = routeAction$(async (data, { env, json }) => {
  const body = data as UserModel;
  await fetch("http://localhost:3005/users", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  json(200, { message: "User created" });
});
export default component$(() => {
  const users = useUserList();
  const createUser = useCreateUser();
  return (
    <>
      
      <div class="flex gap-5">
        <div class="flex-1 overflow-y-auto flex flex-col gap-2 pb-5">
          {users.value.length > 0 ? (
            users.value.map((user) => (
              <Card key={user.id}>
                <CardHeading>{user.name}</CardHeading>
                <div>
                  <p>{user.email}</p>
                  <p>{user.addressLineOne}</p>
                  <p>{user.addressLineTwo}</p>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div class="text-center">
                <CardHeading>No Users Found</CardHeading>
              </div>
            </Card>
          )}
        </div>
        <div class="overflow-y-auto">
          <Card>
            <div>
              <CardHeading>Add User</CardHeading>
              <Form action={createUser} class="grid gap-2">
                <TextField inputName="name" label="Name" />
                <TextField inputName="email" label="Email" />
                <TextField inputName="addressLineOne" label="Address Line 1" />
                <TextField inputName="addressLineTwo" label="Address Line 2" />
                <Button type="submit">Add User</Button>
              </Form>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
});
