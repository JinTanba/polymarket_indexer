// src/services/fpmm.ts
import {
	GET_FPMM_CONDITIONS,
	GET_COLLATERALS,
	GET_FPMMS,
	GET_FUNDING_ADDITIONS,
	GET_FUNDING_REMOVALS,
	GET_FPMM_TRANSACTIONS,
	GET_FPMM_POOL_MEMBERSHIPS,
} from "../graphql/fpmm/queries";
import { createApolloClient } from "../config/appolloClient";
import { FPMM_PATH } from "../path";

export async function fetchAllFpmmData(fromTime: number, toTime: number) {
	const endpoint = FPMM_PATH;
	if (!endpoint) {
		throw new Error("FPMM_PATH is not set");
	}
	const client = createApolloClient(endpoint);

	const queries = [
		{
			query: GET_FPMM_CONDITIONS,
			dataField: "conditions",
			useTimeFilter: false,
		},
		{ query: GET_COLLATERALS, dataField: "collaterals", useTimeFilter: false },
		{
			query: GET_FPMMS,
			dataField: "fixedProductMarketMakers",
			useTimeFilter: false,
		},
		{
			query: GET_FUNDING_ADDITIONS,
			dataField: "fpmmFundingAdditions",
			useTimeFilter: true,
		},
		{
			query: GET_FUNDING_REMOVALS,
			dataField: "fpmmFundingRemovals",
			useTimeFilter: true,
		},
		{
			query: GET_FPMM_TRANSACTIONS,
			dataField: "fpmmTransactions",
			useTimeFilter: true,
		},
		{
			query: GET_FPMM_POOL_MEMBERSHIPS,
			dataField: "fpmmPoolMemberships",
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
				process.stdout.write(`\r${progressPrefix}: ${allEntities.length} entries fetched`);
			}
		}
		
		process.stdout.write(`\r✓ ${progressPrefix} completed: ${allEntities.length} total entries\n`);
		results[dataField] = allEntities;
	}

	process.stdout.write("All data fetching completed\n");
	return results;
}
