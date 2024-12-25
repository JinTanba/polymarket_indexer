import { gql } from "@apollo/client/core";

export const GET_FPMM_CONDITIONS = gql`
	query GetConditions($first: Int!, $skip: Int!) {
		conditions(first: $first, skip: $skip) {
			id
		}
	}
`;

export const GET_COLLATERALS = gql`
	query GetCollaterals($first: Int!, $skip: Int!) {
		collaterals(first: $first, skip: $skip) {
			id
			name
			symbol
			decimals
		}
	}
`;

export const GET_FPMMS = gql`
	query GetFPMMs($first: Int!, $skip: Int!) {
		fixedProductMarketMakers(first: $first, skip: $skip) {
			id
			creator
			creationTimestamp
			creationTransactionHash
			collateralToken {
				id
			}
			fee
			tradesQuantity
			buysQuantity
			sellsQuantity
			liquidityAddQuantity
			liquidityRemoveQuantity
			collateralVolume
			scaledCollateralVolume
			outcomeSlotCount
		}
	}
`;

// FundingAddition
export const GET_FUNDING_ADDITIONS = gql`
	query GetFpmmFundingAdditions(
		$first: Int!
		$skip: Int!
		$from: BigInt!
		$to: BigInt!
	) {
		fpmmFundingAdditions(
			first: $first
			skip: $skip
			where: { timestamp_gte: $from, timestamp_lte: $to }
		) {
			id
			timestamp
			funder
			sharesMinted
			fpmm {
				id
			}
		}
	}
`;

// FundingRemoval
export const GET_FUNDING_REMOVALS = gql`
	query GetFpmmFundingRemovals(
		$first: Int!
		$skip: Int!
		$from: BigInt!
		$to: BigInt!
	) {
		fpmmFundingRemovals(
			first: $first
			skip: $skip
			where: { timestamp_gte: $from, timestamp_lte: $to }
		) {
			id
			timestamp
			funder
			sharesBurnt
			fpmm {
				id
			}
		}
	}
`;

// Transaction
export const GET_FPMM_TRANSACTIONS = gql`
	query GetFpmmTransactions(
		$first: Int!
		$skip: Int!
		$from: BigInt!
		$to: BigInt!
	) {
		fpmmTransactions(
			first: $first
			skip: $skip
			where: { timestamp_gte: $from, timestamp_lte: $to }
		) {
			id
			timestamp
			user
			tradeAmount
			feeAmount
		}
	}
`;

export const GET_FPMM_POOL_MEMBERSHIPS = gql`
	query GetFpmmPoolMemberships($first: Int!, $skip: Int!) {
		fpmmPoolMemberships(first: $first, skip: $skip) {
			id
			funder
			amount
			pool {
				id
			}
		}
	}
`;
