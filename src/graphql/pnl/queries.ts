import { gql } from "@apollo/client/core";

// UserPosition, NegRiskEvent, Condition, FPMM (一部 timestamp がないため from/to は使わない)
export const GET_USER_POSITIONS = gql`
	query GetUserPositions($first: Int!, $skip: Int!) {
		userPositions(first: $first, skip: $skip) {
			id
			user
			tokenId
			amount
			avgPrice
			realizedPnl
			totalBought
		}
	}
`;

export const GET_NEG_RISK_EVENTS_PNL = gql`
	query GetNegRiskEvents($first: Int!, $skip: Int!) {
		negRiskEvents(first: $first, skip: $skip) {
			id
			questionCount
		}
	}
`;

export const GET_CONDITIONS_PNL = gql`
	query GetConditions($first: Int!, $skip: Int!) {
		conditions(first: $first, skip: $skip) {
			id
			positionIds
			payoutNumerators
			payoutDenominator
		}
	}
`;

export const GET_FPMMS_PNL = gql`
	query GetFPMMs($first: Int!, $skip: Int!) {
		fpmms(first: $first, skip: $skip) {
			id
			conditionId
		}
	}
`;
