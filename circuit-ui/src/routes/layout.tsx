import { component$, Slot } from "@builder.io/qwik";
import { Link, type RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    noCache: true,
  });
};

export default component$(() => {
  return (
    <div class="m-0 h-screen p-0">
      <div class="sticky inset-x-0 left-0 top-0 z-10 mb-5 bg-white py-5 shadow-md">
        <div class="flex justify-end px-5">
          <Link href="/" class="text-lg font-bold text-blue-500">
            Home
          </Link>
          <Link href="/orders" class="ml-5 text-lg font-bold text-blue-500">
            Orders
          </Link>
          <Link href="/stores" class="ml-5 text-lg font-bold text-blue-500">
            Stores
          </Link>
        </div>
      </div>
      <Slot />
    </div>
  );
});
