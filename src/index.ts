// src/index.ts
import "dotenv/config"; // これで .env が読み込まれる
import minimist from "minimist";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";
import cliProgress from "cli-progress";

import {
	fetchAllActivityData,
	fetchAllFpmmData,
	fetchAllOiData,
	fetchAllOrderbookData,
	fetchAllPnlData,
} from "./services";

// CSVファイルを書き出す関数を追加
function writeDataToCsv(data: any[], filename: string) {
	if (!data || data.length === 0) {
		console.log(`⚠️ Skipping ${filename}: No data available`);
		return;
	}

	console.log(`\n📝 Processing ${filename} (${data.length} records)...`);

	const csvDir = path.join(process.cwd(), "csv");
	if (!fs.existsSync(csvDir)) {
		console.log(`📁 Creating directory: ${csvDir}`);
		fs.mkdirSync(csvDir);
	}

	const headers = Object.keys(data[0]);
	console.log(`🔍 Columns: ${headers.join(", ")}`);

	const progressBar =
		data.length >= 1000
			? new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
			: null;
	if (progressBar) {
		progressBar.start(data.length, 0);
	}

	const csvContent = [
		headers.join(","),
		...data.map((row, index) => {
			if (progressBar && index % 100 === 0) {
				progressBar.update(index);
			}
			return headers.map((header) => JSON.stringify(row[header])).join(",");
		}),
	].join("\n");

	if (progressBar) {
		progressBar.stop();
	}

	const filePath = path.join(csvDir, `${filename}.csv`);
	fs.writeFileSync(filePath, csvContent);
	console.log(`✅ CSV file written: ${filePath} (${data.length} rows)`);
}

async function main() {
	try {
		const args = minimist(process.argv.slice(2));
		/**
		 * 使い方:
		 *   node dist/index.js --schema=activity --fromTime=1660000000 --toTime=1669999999 --csv
		 *   node dist/index.js --schema=all
		 *   node dist/index.js --schema=fpmm --fromTime=1660000000 --toTime=1669999999
		 */
		const schema = args.schema || "all"; // デフォルトは "all"
		const fromTime = args.fromTime ? parseInt(args.fromTime, 10) : 0;
		const toTime = args.toTime ? parseInt(args.toTime, 10) : dayjs().unix();

		console.log("🚀 Starting data export...");
		console.log(`📊 Schema: ${schema}`);
		console.log(`⏰ Time range: ${fromTime} -> ${toTime}`);
		console.log(`📑 CSV output: ${args.csv ? "enabled" : "disabled"}\n`);

		// 引数の検証を追加
		if (schema !== "all" && !["activity", "fpmm", "oi", "orderbook", "pnl"].includes(schema)) {
			throw new Error(`無効なスキーマ: ${schema}`);
		}

		// CSV出力フラグ
		const outputCsv = args.csv || false;

		// 各データフェッチ処理にtry-catchを追加
		if (schema === "all" || schema === "activity") {
			try {
				console.log("\n📊 Fetching Activity Data...");
				const startTime = Date.now();
				const activityData = await fetchAllActivityData(fromTime, toTime);
				const duration = ((Date.now() - startTime) / 1000).toFixed(2);
				console.log(`✅ Activity Data fetched in ${duration}s\n`);

				console.log("----- Activity Data Summary -----");
				console.log("Splits:", activityData.splits?.length || 0);
				console.log("Merges:", activityData.merges?.length || 0);
				console.log("Redemptions:", activityData.redemptions?.length || 0);
				console.log(
					"NegRiskConversions:",
					activityData.negRiskConversions?.length || 0
				);
				console.log("NegRiskEvents:", activityData.negRiskEvents?.length || 0);
				console.log(
					"FixedProductMarketMakers:",
					activityData.fixedProductMarketMakers?.length || 0
				);
				console.log("Positions:", activityData.positions?.length || 0);
				console.log("Conditions:", activityData.conditions?.length || 0);
				console.log("-------------------------\n");

				if (outputCsv) {
					writeDataToCsv(activityData.splits || [], "activity_splits");
					writeDataToCsv(activityData.merges || [], "activity_merges");
					writeDataToCsv(activityData.redemptions || [], "activity_redemptions");
					writeDataToCsv(
						activityData.negRiskConversions || [],
						"activity_neg_risk_conversions"
					);
					writeDataToCsv(
						activityData.negRiskEvents || [],
						"activity_neg_risk_events"
					);
					writeDataToCsv(
						activityData.fixedProductMarketMakers || [],
						"activity_fpmm"
					);
					writeDataToCsv(activityData.positions || [], "activity_positions");
					writeDataToCsv(activityData.conditions || [], "activity_conditions");
				}
			} catch (error) {
				console.error("Activity データの取得中にエラーが発生しました:", error);
			}
		}

		if (schema === "all" || schema === "fpmm") {
			console.log("\n📊 Fetching FPMM Data...");
			const startTime = Date.now();
			const fpmmData = await fetchAllFpmmData(fromTime, toTime);
			const duration = ((Date.now() - startTime) / 1000).toFixed(2);
			console.log(`✅ FPMM Data fetched in ${duration}s\n`);

			console.log("----- FPMM Data Summary -----");
			console.log("Conditions:", fpmmData.conditions?.length || 0);
			console.log("Collaterals:", fpmmData.collaterals?.length || 0);
			console.log(
				"FixedProductMarketMakers:",
				fpmmData.fixedProductMarketMakers?.length || 0
			);
			console.log(
				"FundingAdditions:",
				fpmmData.fpmmFundingAdditions?.length || 0
			);
			console.log("FundingRemovals:", fpmmData.fpmmFundingRemovals?.length || 0);
			console.log("Transactions:", fpmmData.fpmmTransactions?.length || 0);
			console.log("PoolMemberships:", fpmmData.fpmmPoolMemberships?.length || 0);
			console.log("----------------------\n");

			if (outputCsv) {
				writeDataToCsv(fpmmData.conditions || [], "fpmm_conditions");
				writeDataToCsv(fpmmData.collaterals || [], "fpmm_collaterals");
				writeDataToCsv(fpmmData.fixedProductMarketMakers || [], "fpmm_fpmm");
				writeDataToCsv(
					fpmmData.fpmmFundingAdditions || [],
					"fpmm_funding_additions"
				);
				writeDataToCsv(
					fpmmData.fpmmFundingRemovals || [],
					"fpmm_funding_removals"
				);
				writeDataToCsv(fpmmData.fpmmTransactions || [], "fpmm_transactions");
				writeDataToCsv(
					fpmmData.fpmmPoolMemberships || [],
					"fpmm_pool_memberships"
				);
			}
		}

		if (schema === "all" || schema === "oi") {
			const oiData = await fetchAllOiData();
			console.log("----- OI Data -----");
			console.log("Conditions:", oiData.conditions?.length || 0);
			console.log("NegRiskEvents:", oiData.negRiskEvents?.length || 0);
			console.log(
				"MarketOpenInterests:",
				oiData.marketOpenInterests?.length || 0
			);
			console.log(
				"GlobalOpenInterests:",
				oiData.globalOpenInterests?.length || 0
			);
			console.log("-------------------\n");

			if (outputCsv) {
				writeDataToCsv(oiData.conditions || [], "oi_conditions");
				writeDataToCsv(oiData.negRiskEvents || [], "oi_neg_risk_events");
				writeDataToCsv(
					oiData.marketOpenInterests || [],
					"oi_market_open_interests"
				);
				writeDataToCsv(
					oiData.globalOpenInterests || [],
					"oi_global_open_interests"
				);
			}
		}

		if (schema === "all" || schema === "orderbook") {
			const orderbookData = await fetchAllOrderbookData(fromTime, toTime);
			console.log("----- Orderbook Data -----");
			console.log("MarketDatas:", orderbookData.marketDatas?.length || 0);
			console.log(
				"OrderFilledEvents:",
				orderbookData.orderFilledEvents?.length || 0
			);
			console.log(
				"OrdersMatchedEvents:",
				orderbookData.ordersMatchedEvents?.length || 0
			);
			console.log("Orderbooks:", orderbookData.orderbooks?.length || 0);
			console.log(
				"OrdersMatchedGlobals:",
				orderbookData.ordersMatchedGlobals?.length || 0
			);
			console.log("--------------------------\n");

			if (outputCsv) {
				writeDataToCsv(orderbookData.marketDatas || [], "orderbook_market_datas");
				writeDataToCsv(
					orderbookData.orderFilledEvents || [],
					"orderbook_order_filled_events"
				);
				writeDataToCsv(
					orderbookData.ordersMatchedEvents || [],
					"orderbook_orders_matched_events"
				);
				writeDataToCsv(orderbookData.orderbooks || [], "orderbook_orderbooks");
				writeDataToCsv(
					orderbookData.ordersMatchedGlobals || [],
					"orderbook_orders_matched_globals"
				);
			}
		}

		if (schema === "all" || schema === "pnl") {
			const pnlData = await fetchAllPnlData();
			console.log("----- PNL Data -----");
			console.log("UserPositions:", pnlData.userPositions?.length || 0);
			console.log("NegRiskEvents:", pnlData.negRiskEvents?.length || 0);
			console.log("Conditions:", pnlData.conditions?.length || 0);
			console.log("FPMMs:", pnlData.fpmms?.length || 0);
			console.log("---------------------\n");

			if (outputCsv) {
				writeDataToCsv(pnlData.userPositions || [], "pnl_user_positions");
				writeDataToCsv(pnlData.negRiskEvents || [], "pnl_neg_risk_events");
				writeDataToCsv(pnlData.conditions || [], "pnl_conditions");
				writeDataToCsv(pnlData.fpmms || [], "pnl_fpmms");
			}
		}

		console.log("🎉 All done!");
	} catch (error) {
		console.error("予期せぬエラーが発生しました:", error);
		throw error;
	}
}

main().catch((err) => {
	console.error("致命的なエラーが発生しました:");
	console.error(err);
	process.exit(1);
});
