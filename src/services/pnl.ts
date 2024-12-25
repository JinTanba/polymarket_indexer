// src/services/pnlService.ts
import {
	GET_USER_POSITIONS,
	GET_NEG_RISK_EVENTS_PNL,
	GET_CONDITIONS_PNL,
	GET_FPMMS_PNL,
} from "../graphql/pnl/queries";
import { createApolloClient } from "../config/appolloClient";
import { PNL_PATH } from "../path";

export async function fetchAllPnlData() {
	const endpoint = PNL_PATH;
	if (!endpoint) {
		throw new Error("PNL_PATH is not set");
	}
	const client = createApolloClient(endpoint);

	const queries = [
		{ query: GET_USER_POSITIONS, dataField: "userPositions" },
		{ query: GET_NEG_RISK_EVENTS_PNL, dataField: "negRiskEvents" },
		{ query: GET_CONDITIONS_PNL, dataField: "conditions" },
		{ query: GET_FPMMS_PNL, dataField: "fpmms" },
	];

	const results: Record<string, any[]> = {};

	for (const { query, dataField } of queries) {
		process.stdout.write(`\rFetching ${dataField}...`);
		const allEntities: any[] = [];
		let skip = 0;
		const batchSize = 1000;

		while (true) {
			const variables = { first: batchSize, skip };
			const { data } = await client.query({ query, variables });
			const chunk = data[dataField] ?? [];
			allEntities.push(...chunk);

			process.stdout.write(`\r${dataField}: ${allEntities.length} entries fetched`);

			if (chunk.length < batchSize) break;
			skip += batchSize;
		}
		results[dataField] = allEntities;
		process.stdout.write(`\r✅ Completed ${dataField}: ${allEntities.length} entries\n`);
	}

	return results;
}
