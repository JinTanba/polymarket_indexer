import { gql } from "@apollo/client/core";

// MarketData, OrderFilledEvent, OrdersMatchedEvent, Orderbook, OrdersMatchedGlobal
// timestamp があるのは OrderFilledEvent / OrdersMatchedEvent

export const GET_MARKET_DATA = gql`
	query GetMarketData($first: Int!, $skip: Int!) {
		marketDatas(first: $first, skip: $skip) {
			id
			condition
			outcomeIndex
		}
	}
`;

export const GET_ORDER_FILLED_EVENTS = gql`
	query GetOrderFilledEvents(
		$first: Int!
		$skip: Int!
		$from: BigInt!
		$to: BigInt!
	) {
		orderFilledEvents(
			first: $first
			skip: $skip
			where: { timestamp_gte: $from, timestamp_lte: $to }
		) {
			id
			timestamp
			maker
			taker
			makerAssetId
			takerAssetId
			makerAmountFilled
			takerAmountFilled
			fee
		}
	}
`;

export const GET_ORDERS_MATCHED_EVENTS = gql`
	query GetOrdersMatchedEvents(
		$first: Int!
		$skip: Int!
		$from: BigInt!
		$to: BigInt!
	) {
		ordersMatchedEvents(
			first: $first
			skip: $skip
			where: { timestamp_gte: $from, timestamp_lte: $to }
		) {
			id
			timestamp
			makerAssetID
			takerAssetID
			makerAmountFilled
			takerAmountFilled
		}
	}
`;

export const GET_ORDERBOOKS = gql`
	query GetOrderbooks($first: Int!, $skip: Int!) {
		orderbooks(first: $first, skip: $skip) {
			id
			tradesQuantity
			buysQuantity
			sellsQuantity
		}
	}
`;

export const GET_ORDERS_MATCHED_GLOBAL = gql`
	query GetOrdersMatchedGlobals($first: Int!, $skip: Int!) {
		ordersMatchedGlobals(first: $first, skip: $skip) {
			id
			tradesQuantity
			buysQuantity
			sellsQuantity
		}
	}
`;
