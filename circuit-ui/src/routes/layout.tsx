import { component$, Slot } from "@builder.io/qwik";
import { Link, type RequestHandler } from "@builder.io/qwik-city";
import { Button } from "~/components/ui/UIComponents";

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
      <div class="sticky inset-x-0 left-0 top-0 z-10 mb-5 bg-[#002547] py-2 shadow-md">
        <div class="flex items-center justify-end gap-5 px-2">
          <Link
            href="/"
            class="rounded-md p-2 text-lg font-bold text-[#f99d1d] hover:bg-[#32587c]"
          >
            Home
          </Link>
          <Link
            href="/orders"
            class="rounded-md p-2 text-lg font-bold text-[#f99d1d] hover:bg-[#32587c]"
          >
            Orders
          </Link>
          <Link
            href="/stores"
            class="rounded-md p-2 text-lg font-bold text-[#f99d1d] hover:bg-[#32587c]"
          >
            Stores
          </Link>
          <Button class="ml-auto">
            <Link href="/cdn-cgi/access/logout">Logout</Link>
          </Button>
        </div>
      </div>
      <Slot />
    </div>
  );
});
