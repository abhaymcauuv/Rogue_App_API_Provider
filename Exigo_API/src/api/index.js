/** File Name : Index.js
 * Description : 
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 15th Feb 2020
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
import {
    getCustomerList,
    getCustomerDetails,
    getOrderList,
    getAutoOrderList,
    getClubCoutureCustomerList,
    getActivity,
    getVolumesList,
    getRankAdvancement
} from '../service/report/report';

//#region Commission


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
 * @param PeriodTypeID
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

//#endregion

//#region Report

/**
 * Get Customer List
 * @param CustomerID
 * @param PageSize
 * @param PageNo
 * @param IsCount
 * @param SortName
 * @param SortOrder
 * @param SearchData
 * @returns Customer List
 */
export const customerList = function (request, reply) {
    const customerId = Number(request.payload.CustomerID);
    const pageSize = Number(request.payload.PageSize);
    const pageNo = Number(request.payload.PageNo);
    return getCustomerList({
        CustomerID: customerId,
        PageSize: pageSize,
        PageNo: pageNo,
        IsCount: request.payload.IsCount,
        SortName: request.payload.SortName,
        SortOrder: request.payload.SortOrder,
        SearchData: request.payload.SearchData
    });
}


/**
 * Get Customer Details
 * @param CustomerID
 * @param ID
 * @returns Customer Details
 */
export const customerDetails = function (request, reply) {
    const customerId = Number(request.payload.CustomerID);
    const id = Number(request.payload.ID);
    return getCustomerDetails(id, customerId);
}

/**
 * Get Order List
 * @param CustomerID
 * @param ID
 * @param PageSize
 * @param PageNo
 * @param IsCount
 * @param SortName
 * @param SortOrder
 * @returns Order List
 */
export const orderList = function (request, reply) {
    const customerId = Number(request.payload.CustomerID);
    const id = Number(request.payload.ID);
    const pageSize = Number(request.payload.PageSize);
    const pageNo = Number(request.payload.PageNo);
    return getOrderList({
        CustomerID: customerId,
        ID: id,
        PageSize: pageSize,
        PageNo: pageNo,
        IsCount: request.payload.IsCount,
        SortName: request.payload.SortName,
        SortOrder: request.payload.SortOrder
    });
}

/**
 * Get AutoOrder List
 * @param CustomerID
 * @param ID
 * @param PageSize
 * @param PageNo
 * @param IsCount
 * @param SortName
 * @param SortOrder
 * @returns AutoOrder List
 */
export const autoOrderList = function (request, reply) {
    const customerId = Number(request.payload.CustomerID);
    const id = Number(request.payload.ID);
    const pageSize = Number(request.payload.PageSize);
    const pageNo = Number(request.payload.PageNo);
    return getAutoOrderList({
        CustomerID: customerId,
        ID: id,
        PageSize: pageSize,
        PageNo: pageNo,
        IsCount: request.payload.IsCount,
        SortName: request.payload.SortName,
        SortOrder: request.payload.SortOrder
    });
}

/**
 * Get Club Couture Customer List 
 * @param CustomerID
 * @param PageSize
 * @param PageNo
 * @param IsCount
 * @param IncludeClosedAccounts
 * @param SortName
 * @param SortOrder
 * @param SearchData
 * @returns Club Couture Customer List 
 */
export const clubCoutureCustomerList = function (request, reply) {
    const customerId = Number(request.payload.CustomerID);
    const pageSize = Number(request.payload.PageSize);
    const pageNo = Number(request.payload.PageNo);
    return getClubCoutureCustomerList({
        CustomerID: customerId,
        PageSize: pageSize,
        PageNo: pageNo,
        IsCount: request.payload.IsCount,
        IncludeClosedAccounts: request.payload.IncludeClosedAccounts,
        SortName: request.payload.SortName,
        SortOrder: request.payload.SortOrder,
        SearchData: request.payload.SearchData
    });
}

/**
 * Get Customer's Recent Activity 
 * @param CustomerID
 * @returns  Customer's Recent Activity 
 */
export const activity = function (request, reply) {
    const customerId = Number(request.params.id);
    return getActivity(customerId);
}

/**
 * Get Volumes List
 * @param ID
 * @param PageSize
 * @param PageNo
 * @param IsCount
 * @param SortName
 * @param SortOrder
 * @returns Volumes List
 */
export const volumesList = function (request, reply) {
    const customerId = Number(request.payload.ID);
    const pageSize = Number(request.payload.PageSize);
    const pageNo = Number(request.payload.PageNo);
    return getVolumesList({
        ID: customerId,
        PageSize: pageSize,
        PageNo: pageNo,
        IsCount: request.payload.IsCount,
        SortName: request.payload.SortName,
        SortOrder: request.payload.SortOrder
    });
}

/**
 * Get Rank Advancement
 * @param ID
 * @returns Rank Advancement
 */
export const rankAdvancement = function (request, reply) {
    const customerId = Number(request.params.id);
    return getRankAdvancement(customerId);
}

//#endregion