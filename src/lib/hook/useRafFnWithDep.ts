import { useRafFn, type UseRafFnCallbackArguments, type UseRafFnOptions } from "@vueuse/core";
import { watch, type WatchSource } from "vue";

interface UseRafFnWithDepOptions extends Omit<UseRafFnOptions, "immediate"> {
	dep: WatchSource<boolean>;
}

export function useRafFnWithDep(
	fn: (args: UseRafFnCallbackArguments) => void,
	options: UseRafFnWithDepOptions,
) {
	const { dep, ...rest } = options;
	const pausable = useRafFn(fn, { ...rest, immediate: false });

	watch(
		dep,
		(value) => {
			if (value) pausable.resume();
			else pausable.pause();
		},
		{
			immediate: true,
		},
	);

	return pausable;
}
