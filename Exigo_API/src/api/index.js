/** File Name : Index.js
 * Description : 
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 1st Feb 2020
 */
import {
    getCustomerRealTimeCommissions,
    getHistoricalCommissionPeriod,
    getSummaryCommissions,
    getCurrentCommission,
    getHistoricalCommissions,
    getRealTimeBonusDetails,
    getHistoricalBonusDetails
} from '../service/commission/commission';
import { getCurrentPeriod, getPeriods } from '../service/period/period';
import * as constants from '../common/constant';

/**
 * Get Customer RealTime Commissions
 * @param CustomerID
 * @param GetPeriodVolumes
 * @returns Customer RealTime Commissions
 */
export const customerRealTimeCommissions = function (request, reply) {
    const customerId = Number(request.payload.CustomerID);
    const getPeriodVolumes = request.payload.GetPeriodVolumes;
    return getCustomerRealTimeCommissions({ CustomerID: customerId, GetPeriodVolumes: getPeriodVolumes });
}

/**
 * Get Historical Commission Period
 */
export const historicalCommissionPeriod = function (request, reply) {
    return getHistoricalCommissionPeriod();
}

/**
 * Get Current Period
 * @param periodtypeid
 * @returns Current Period
 */
export const currentPeriod = function (request, reply) {
    const periodTypeId = request.params.periodtypeid;
    return getCurrentPeriod(periodTypeId);
}

/**
 * Get Historical Summary Commissions
 * @param customerid
 * @returns Historical Summary Commissions
 */
export const summaryCommissions = function (request, reply) {
    const customerId = Number(request.params.customerid);
    return getSummaryCommissions(customerId);
}

/**
 * Get Current Commission
 * @param customerid
 * @param periodtypeid
 * @returns Current Commission
 */
export const currentCommission = function (request, reply) {
    const customerId = Number(request.params.customerid);
    const periodTypeId = Number(request.params.periodtypeid);
    return getCurrentCommission({ CustomerID: customerId, PeriodTypeID: periodTypeId });
}

/**
 * Get Periods
 * @param PeriodTypeID
 * @param PeriodIDs
 * @returns Current Period
 */
export const periods = function (request, reply) {
    const periodIds = request.payload.PeriodIDs;
    const periodTypeId = request.payload.PeriodTypeID;
    return getPeriods({ PeriodIDs: periodIds, PeriodTypeID: periodTypeId });
}



/**
 * Get Historical Commissions
 * @param customerid
 * @param runid
 * @returns Historical Commissions
 */
export const historicalCommissions = function (request, reply) {
    const customerId = request.params.customerid;
    const commissionRunId = request.params.runid;
    return getHistoricalCommissions({ CustomerID: customerId, CommissionRunID: commissionRunId });
}


/**
 * Get RealTime Bonus Details
 * @param CustomerID
 * @param PeriodID
 * @param BonusID
 * @param PeriodID
 * @returns RealTime Bonus Details
 */
export const realTimeBonusDetails = function (request, reply) {
    const customerId = Number(request.payload.CustomerID);
    const bonusId = Number(request.payload.BonusID);
    const periodId = Number(request.payload.PeriodID);
    const periodTypeId = Number(request.payload.PeriodTypeID);
    return getRealTimeBonusDetails({ CustomerID: customerId, PeriodID: periodId, BonusID: bonusId, PeriodTypeID: periodTypeId });
}


/**
 * Get Historical Bonus Details
 * @param CustomerID
 * @param CommissionRunID
 * @param BonusID
 * @param PageSize
 * @param PageNo
 * @returns Historical Bonus
 */
export const historicalBonusDetails = function (request, reply) {
    const customerId = Number(request.payload.CustomerID);
    const bonusId = Number(request.payload.BonusID);
    const commissionRunId = Number(request.payload.CommissionRunID);
    const pageSize = Number(request.payload.PageSize);
    const pageNo = Number(request.payload.PageNo);
    return getHistoricalBonusDetails({ CustomerID: customerId, CommissionRunID: commissionRunId, BonusID: bonusId, PageSize: pageSize, PageNo: pageNo });
}