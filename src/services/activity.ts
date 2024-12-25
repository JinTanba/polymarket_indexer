// src/services/activityService.ts
import {
	GET_SPLITS,
	GET_MERGES,
	GET_REDEMPTIONS,
	GET_NEG_RISK_CONVERSIONS,
	GET_NEG_RISK_EVENTS_ACTIVITY,
	GET_FPMMS_ACTIVITY,
	GET_POSITIONS,
	GET_CONDITIONS_ACTIVITY,
} from "../graphql";
import { createApolloClient } from "../config/appolloClient";
import { ACTIVITY_PATH } from "../path";
interface QueryConfig {
	query: any;
	dataField: string;
	useTimeFilter: boolean;
}

/**
 * Activityサブグラフの「すべてのエンティティ」を取得する関数.
 * @param fromTime timestamp下限
 * @param toTime   timestamp上限
 */
export async function fetchAllActivityData(fromTime: number, toTime: number) {
	const endpoint = ACTIVITY_PATH;
	if (!endpoint) {
		throw new Error("ACTIVITY_PATH is not set in path.ts");
	}

	const client = createApolloClient(endpoint);
	process.stdout.write("データの取得を開始します...\n");

	const queries: QueryConfig[] = [
		{ query: GET_SPLITS, dataField: "splits", useTimeFilter: true },
		{ query: GET_MERGES, dataField: "merges", useTimeFilter: true },
		{ query: GET_REDEMPTIONS, dataField: "redemptions", useTimeFilter: true },
		{
			query: GET_NEG_RISK_CONVERSIONS,
			dataField: "negRiskConversions",
			useTimeFilter: true,
		},

		{
			query: GET_NEG_RISK_EVENTS_ACTIVITY,
			dataField: "negRiskEvents",
			useTimeFilter: false,
		},
		{
			query: GET_FPMMS_ACTIVITY,
			dataField: "fixedProductMarketMakers",
			useTimeFilter: false,
		},
		{ query: GET_POSITIONS, dataField: "positions", useTimeFilter: false },
		{
			query: GET_CONDITIONS_ACTIVITY,
			dataField: "conditions",
			useTimeFilter: false,
		},
	];

	const results: Record<string, any[]> = {};
	const totalQueries = queries.length;

	for (let i = 0; i < queries.length; i++) {
		const { query, dataField, useTimeFilter } = queries[i];
		const progressPrefix = `[${i + 1}/${totalQueries}] ${dataField}`;
		process.stdout.write(`${progressPrefix}のデータを取得中...`);

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
			const chunk: any[] = data[dataField] ?? [];
			allEntities.push(...chunk);

			if (chunk.length > 0) {
				process.stdout.write(`\r${progressPrefix}: ${allEntities.length}件取得済み`);
			}

			if (chunk.length < batchSize) break;
			skip += batchSize;
		}
		results[dataField] = allEntities;
		process.stdout.write(`\r✓ ${progressPrefix}の取得完了: 合計${allEntities.length}件\n`);
	}

	process.stdout.write("全てのデータの取得が完了しました\n");
	return results;
}
