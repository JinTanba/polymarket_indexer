// src/config/apolloClient.ts
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { createHttpLink } from "@apollo/client/link/http";
import fetch from "cross-fetch";

export function createApolloClient(endpoint: string): ApolloClient<any> {
	return new ApolloClient({
		link: createHttpLink({ uri: endpoint, fetch }),
		cache: new InMemoryCache(),
	});
}
