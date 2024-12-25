import { gql } from "@apollo/client/core";

// Condition, NegRiskEvent, MarketOpenInterest, GlobalOpenInterest
export const GET_OI_CONDITIONS = gql`
	query GetOiConditions($first: Int!, $skip: Int!) {
		conditions(first: $first, skip: $skip) {
			id
		}
	}
`;

export const GET_NEG_RISK_EVENTS_OI = gql`
	query GetNegRiskEvents($first: Int!, $skip: Int!) {
		negRiskEvents(first: $first, skip: $skip) {
			id
			feeBps
			questionCount
		}
	}
`;

export const GET_MARKET_OPEN_INTEREST = gql`
	query GetMarketOpenInterests($first: Int!, $skip: Int!) {
		marketOpenInterests(first: $first, skip: $skip) {
			id
			amount
		}
	}
`;

export const GET_GLOBAL_OPEN_INTEREST = gql`
	query GetGlobalOpenInterests($first: Int!, $skip: Int!) {
		globalOpenInterests(first: $first, skip: $skip) {
			id
			amount
		}
	}
`;
