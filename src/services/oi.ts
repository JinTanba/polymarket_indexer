// src/services/oiService.ts
import {
	GET_OI_CONDITIONS,
	GET_NEG_RISK_EVENTS_OI,
	GET_MARKET_OPEN_INTEREST,
	GET_GLOBAL_OPEN_INTEREST,
} from "../graphql/oi/queries";
import { createApolloClient } from "../config/appolloClient";
import { OPEN_INTEREST_PATH } from "../path";

export async function fetchAllOiData() {
	const endpoint = OPEN_INTEREST_PATH;
	if (!endpoint) {
		throw new Error("OPEN_INTEREST_PATH is not set");
	}
	const client = createApolloClient(endpoint);

	const queries = [
		{ query: GET_OI_CONDITIONS, dataField: "conditions" },
		{ query: GET_NEG_RISK_EVENTS_OI, dataField: "negRiskEvents" },
		{ query: GET_MARKET_OPEN_INTEREST, dataField: "marketOpenInterests" },
		{ query: GET_GLOBAL_OPEN_INTEREST, dataField: "globalOpenInterests" },
	];

	const results: Record<string, any[]> = {};

	const totalQueries = queries.length;
	process.stdout.write("Starting data fetch...\n");

	for (let i = 0; i < queries.length; i++) {
		const { query, dataField } = queries[i];
		const progressPrefix = `[${i + 1}/${totalQueries}] ${dataField}`;
		process.stdout.write(`${progressPrefix} fetching...`);

		const allEntities: any[] = [];
		let skip = 0;
		const batchSize = 1000;

		while (true) {
			const variables = { first: batchSize, skip };
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
