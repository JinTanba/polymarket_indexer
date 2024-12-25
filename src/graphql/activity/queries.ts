import { gql } from "@apollo/client/core";

// timestampあり
export const GET_SPLITS = gql`
	query GetSplits($first: Int!, $skip: Int!, $from: BigInt!, $to: BigInt!) {
		splits(
			first: $first
			skip: $skip
			where: { timestamp_gte: $from, timestamp_lte: $to }
		) {
			id
			timestamp
			stakeholder
			condition
			amount
		}
	}
`;

export const GET_MERGES = gql`
	query GetMerges($first: Int!, $skip: Int!, $from: BigInt!, $to: BigInt!) {
		merges(
			first: $first
			skip: $skip
			where: { timestamp_gte: $from, timestamp_lte: $to }
		) {
			id
			timestamp
			stakeholder
			condition
			amount
		}
	}
`;

export const GET_REDEMPTIONS = gql`
	query GetRedemptions(
		$first: Int!
		$skip: Int!
		$from: BigInt!
		$to: BigInt!
	) {
		redemptions(
			first: $first
			skip: $skip
			where: { timestamp_gte: $from, timestamp_lte: $to }
		) {
			id
			timestamp
			redeemer
			condition
			indexSets
			payout
		}
	}
`;

export const GET_NEG_RISK_CONVERSIONS = gql`
	query GetNegRiskConversions(
		$first: Int!
		$skip: Int!
		$from: BigInt!
		$to: BigInt!
	) {
		negRiskConversions(
			first: $first
			skip: $skip
			where: { timestamp_gte: $from, timestamp_lte: $to }
		) {
			id
			timestamp
			stakeholder
			negRiskMarketId
			amount
			indexSet
			questionCount
		}
	}
`;

// timestampなし
export const GET_NEG_RISK_EVENTS_ACTIVITY = gql`
  query GetNegRiskEvents($first: Int!, $skip: Int!) {
    negRiskEvents(first: $first, skip: $skip) {
      id
      questionCount
    }
  }
`;

export const GET_FPMMS_ACTIVITY = gql`
	query GetFPMMs($first: Int!, $skip: Int!) {
		fixedProductMarketMakers(first: $first, skip: $skip) {
			id
		}
	}
`;

export const GET_POSITIONS = gql`
	query GetPositions($first: Int!, $skip: Int!) {
		positions(first: $first, skip: $skip) {
			id
			condition
			outcomeIndex
		}
	}
`;

export const GET_CONDITIONS_ACTIVITY = gql`
	query GetConditions($first: Int!, $skip: Int!) {
		conditions(first: $first, skip: $skip) {
			id
		}
	}
`;
