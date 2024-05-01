import type { Method, PathPattern, UrlParams } from '@rocket.chat/rest-typings';
import type { EndpointFunction } from '@rocket.chat/ui-contexts';
import { useToastMessageDispatch, useEndpoint } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';

type UseEndpointActionOptions<TPathPattern extends PathPattern> = undefined extends UrlParams<TPathPattern>
	? {
			keys?: UrlParams<TPathPattern>;
			successMessage?: string;
	  }
	: {
			keys: UrlParams<TPathPattern>;
			successMessage?: string;
	  };

export function useEndpointAction<
	TMethod extends Method,
	TPathPattern extends PathPattern,
	TOptions extends UseEndpointActionOptions<TPathPattern>,
>(method: TMethod, pathPattern: TPathPattern, options?: TOptions) {
	const sendData = useEndpoint(method, pathPattern, options?.keys as any);

	const dispatchToastMessage = useToastMessageDispatch();

	const mutation = useMutation(sendData, {
		onSuccess: () => {
			if (options?.successMessage) {
				dispatchToastMessage({ type: 'success', message: options.successMessage });
			}
		},
		onError: (error) => {
			dispatchToastMessage({ type: 'error', message: error });
		},
	});

	return mutation.mutateAsync as EndpointFunction<TMethod, TPathPattern>;
}
