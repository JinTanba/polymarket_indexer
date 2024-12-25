// src/services/orderbookService.ts
import {
	GET_MARKET_DATA,
	GET_ORDER_FILLED_EVENTS,
	GET_ORDERS_MATCHED_EVENTS,
	GET_ORDERBOOKS,
	GET_ORDERS_MATCHED_GLOBAL,
} from "../graphql/orderbook/queries";
import { createApolloClient } from "../config/appolloClient";
import { ORDERS_PATH } from "../path";
interface QueryConfig {
	query: any;
	dataField: string;
	useTimeFilter: boolean;
}

export async function fetchAllOrderbookData(fromTime: number, toTime: number) {
	const endpoint = ORDERS_PATH;
	if (!endpoint) {
		throw new Error("ORDERS_PATH is not set");
	}
	const client = createApolloClient(endpoint);

	const queries: QueryConfig[] = [
		{ query: GET_MARKET_DATA, dataField: "marketDatas", useTimeFilter: false },
		{
			query: GET_ORDER_FILLED_EVENTS,
			dataField: "orderFilledEvents",
			useTimeFilter: true,
		},
		{
			query: GET_ORDERS_MATCHED_EVENTS,
			dataField: "ordersMatchedEvents",
			useTimeFilter: true,
		},
		{ query: GET_ORDERBOOKS, dataField: "orderbooks", useTimeFilter: false },
		{
			query: GET_ORDERS_MATCHED_GLOBAL,
			dataField: "ordersMatchedGlobals",
			useTimeFilter: false,
		},
	];

	const results: Record<string, any[]> = {};

	const totalQueries = queries.length;
	process.stdout.write("Starting data fetch...\n");

	for (let i = 0; i < queries.length; i++) {
		const { query, dataField, useTimeFilter } = queries[i];
		const progressPrefix = `[${i + 1}/${totalQueries}] ${dataField}`;
		process.stdout.write(`${progressPrefix} fetching...`);

		const allEntities: any[] = [];
		let skip = 0;
		const batchSize = 1000;

		while (true) {
			const variables: Record<string, any> = { first: batchSize, skip };
			if (useTimeFilter) {
				variables.from = fromTime;
				variables.to = toTime;
			}

			const { data } = await client.query({ query, variables });
			const chunk = data[dataField] ?? [];
			allEntities.push(...chunk);

			if (chunk.length < batchSize) break;
			skip += batchSize;

			if (chunk.length > 0) {
				process.stdout.write(
					`\r${progressPrefix}: ${allEntities.length} entries fetched`
				);
			}
		}
		results[dataField] = allEntities;
		process.stdout.write(
			`\r✓ ${progressPrefix} completed: ${allEntities.length} total entries\n`
		);
	}

	process.stdout.write("All data fetching completed\n");
	return results;
}
