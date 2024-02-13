import { component$, Slot } from "@builder.io/qwik";
import { Link, routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { UserModel } from "~/business-logic/types";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    noCache: true
  });
};

export const useUserList = routeLoader$(async ({ env }) => {
  return fetch("http://localhost:3005/address-book").then((res) =>
    res.json(),
  ) as Promise<UserModel[]>;
});

export default component$(() => {
  return <div class="h-screen p-0 m-0">
    <div class="sticky inset-x-0 left-0 top-0 z-10 bg-white py-5 shadow-md mb-5">
        <div class="flex px-5 justify-end">
          <Link href="/" class="text-lg font-bold text-blue-500">
            Home
          </Link>
          <Link href="/users" class="ml-5 text-lg font-bold text-blue-500">
            Users
          </Link>
        </div>
      </div>
    <Slot />
  </div>
});
