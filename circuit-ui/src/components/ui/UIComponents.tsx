import { QwikIntrinsicElements, Slot, component$ } from "@builder.io/qwik";
import { ClassNameValue, twMerge } from "tailwind-merge";
import { cn } from "~/utils";

export const Card = component$((props: QwikIntrinsicElements['div']) => {
  return (
    <div class={cn("flex flex-col rounded-xl border bg-white bg-clip-border text-gray-700 shadow-md", props.class)}>
      <div class="p-6">
        <Slot />
      </div>
    </div>
  );
});

export const CardHeading = component$(() => {
  return (
    <h5 class="text-blue-gray-900 mb-3 block font-sans text-xl font-semibold leading-snug tracking-normal antialiased">
      <Slot />
    </h5>
  );
});

export const Button = component$(
  (props: QwikIntrinsicElements['button']) => {
    const classes = twMerge('select-none rounded-lg bg-gray-900 px-6 py-3 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"', 'p-3 bg-[#B91C1C]', props.class as ClassNameValue, props.disabled ? 'opacity-50 shadow-none pointer-events-none' : '')

    return (
      <button
        onClick$={props.onClick$}
        class={classes}
        type={props.type || "button"}
      >
        <Slot />
      </button>
    );
  },
);
