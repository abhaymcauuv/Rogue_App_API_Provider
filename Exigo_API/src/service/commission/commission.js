/** File Name : Commission.js
 * Description :  To get commission details
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 31st Jan 2020
 */
import sql from 'mssql';
import { getCurrentPeriod, getPeriods } from '../period/period';
import { getRealTimeCommissions, getRealTimeCommissionDetails } from '../webservice/webservice';
import { executeQuery } from '../../db/mssql';
import { getCustomerVolumes } from '../volume/volume';
import { getCustomerOrders } from '../order/order';
import * as constants from '../../common/constant';

/**
 * Get Summary Commission
 * @param customerID
 * @returns Summary Commission
 */
export const getSummaryCommissions = function (customerID) {
    return new Promise(async (resolve, reject) => {
        try {
            let query = `SELECT
                                  hs.DesignerID
                                 ,HSStartDate = hs.Period
                                 ,hs.PaidAsTitle
                                 ,hs.Commission
                                 ,hs.PV
                                 ,hs.TV
                                 ,hs.EV
                                 ,hs.PSQ
                                 ,hs.L1M
                                 ,hs.MML
                                 ,p.PeriodID
                                 ,p.PeriodTypeID
                                 ,p.PeriodDescription
                                 ,p.StartDate
                                 ,p.EndDate
                                 ,dateadd(day, 1, p.EndDate) as ActualEndDate
                         FROM [HistoricalCommission].[HistoricalSummary] hs
                         INNER JOIN Periods p
                         ON CONVERT(date, hs.Period) = CONVERT(date, p.StartDate)
                         WHERE designerid = @customerid
                         ORDER BY p.StartDate DESC`;

            let params = [
                {
                    Name: 'customerid',
                    Type: sql.BigInt,
                    Value: customerID
                }
            ];
            let summaryCommissionResult = await executeQuery({ SqlQuery: query, SqlParams: params });
            return resolve(summaryCommissionResult);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}

/**
 * Get Historical Commission Period 
 * @returns Historical Commission Period 
 */
export const getHistoricalCommissionPeriod = function () {
    return new Promise(async (resolve, reject) => {
        try {
            let query = `SELECT cr.CommissionRunID
                                             ,cr.CommissionRunDescription
                                             ,cr.RunDate
                                             ,cr.AcceptedDate
                                             ,cr.CommissionRunStatusID
                                             ,cr.HideFromWeb
                                             ,cr.PlanID
                                             ,p.PeriodID
                                             ,p.PeriodDescription
                                             ,p.PeriodTypeID
                                             ,p.StartDate
                                             ,p.EndDate
                                             ,dateadd(day, 1, p.EndDate) as ActualEndDate
                                            -- ,p.AcceptedDate
                                       FROM CommissionRuns cr
                                           LEFT JOIN Periods p
                                               ON cr.PeriodID = p.PeriodID
                                               AND cr.PeriodTypeID = p.PeriodTypeID
                                       --WHERE p.StartDate >= '2018-07-01'
                                       ORDER BY cr.PeriodID DESC`;

            let params = [];
            let commissionPeriodResult = await executeQuery({ SqlQuery: query, SqlParams: params });
            return resolve(commissionPeriodResult);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });

}

/**
 * Get Historical Commissions  
 * @param CustomerID
 * @param CommissionRunID
 * @returns Historical Commissions  
 */
export const getHistoricalCommissions = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let customerID = Number(request.CustomerID);
            let commissionRunID = Number(request.CommissionRunID);

            let Commission = {};
            let historicalCommissionQuery = `SELECT c.CommissionRunID
                                          ,c.CustomerID
                                          ,c.CurrencyCode
                                          ,c.Earnings
                                          ,c.PreviousBalance
                                          ,c.BalanceForward
                                          ,c.Fee
                                          ,c.Total
                                          ,cr.CommissionRunDescription
                                          ,cr.RunDate
                                          ,cr.CommissionRunStatusID
                                          ,cr.HideFromWeb
                                          ,cr.PlanID
                                          ,RankID = pv.PaidRankID
                                          ,r.RankDescription
                                          ,cr.PeriodID
                                          ,p.PeriodDescription
                                          ,p.PeriodTypeID
                                          ,p.StartDate
                                          ,p.EndDate
                                          ,dateadd(day, 1, p.EndDate) as ActualEndDate
                                          ,cr.AcceptedDate
                                    FROM Commissions c
                                         LEFT JOIN CommissionRuns cr
                                              ON c.CommissionRunID = cr.CommissionRunID
                                         LEFT JOIN Periods p
                                              ON cr.periodid = p.periodid
                                              and cr.periodtypeid = p.periodtypeid
                                         LEFT JOIN PeriodVolumes pv 
                                              ON pv.periodid = p.periodid
                                              and pv.periodtypeid = p.periodtypeid
                                              and pv.customerid = c.customerid
                                         LEFT JOIN Ranks r
                                              ON r.RankID = pv.PaidRankID
                                         WHERE c.CustomerID = @customerid
                                              AND c.CommissionRunID = @commissionrunid 
                                         ORDER BY cr.periodid DESC`;

            let params = [
                {
                    Name: 'commissionrunid',
                    Type: sql.Int,
                    Value: commissionRunID
                },
                {
                    Name: 'customerid',
                    Type: sql.BigInt,
                    Value: customerID
                }
            ];

            let historicalCommissionResult = await executeQuery({ SqlQuery: historicalCommissionQuery, SqlParams: params });
            let resData = historicalCommissionResult[0];

            if (!resData) {
                let historicalCommissionQuery2 = `SELECT 
                                            cr.CommissionRunDescription
                                           ,cr.PeriodTypeID
                                           ,cr.RunDate
                                           ,cr.CommissionRunStatusID
                                           ,cr.HideFromWeb
                                           ,cr.PlanID
                                           ,RankID = pv.PaidRankID
                                           ,r.RankDescription
                                           ,cr.PeriodID
                                           ,p.PeriodDescription
                                           ,p.PeriodTypeID
                                           ,p.StartDate
                                           ,p.EndDate
                                           ,dateadd(day, 1, p.EndDate) as ActualEndDate
                                           ,cr.AcceptedDate
                                  FROM CommissionRuns cr
                                       LEFT JOIN Periods p
                                            ON cr.periodid = p.periodid
                                            and cr.periodtypeid = p.periodtypeid
                                       LEFT JOIN PeriodVolumes pv 
                                            ON pv.periodid = p.periodid
                                            and pv.periodtypeid = p.periodtypeid
                                            and pv.customerid = @customerid
                                       LEFT JOIN Ranks r
                                            ON r.RankID = pv.PaidRankID
                                       WHERE cr.CommissionRunID =@commissionrunid
                                       ORDER BY cr.periodid DESC`;

                let historicalCommissionResult2 = await executeQuery({ SqlQuery: historicalCommissionQuery2, SqlParams: params });
                resData = historicalCommissionResult2[0];
            }

            if (resData) {
                let volumeResponse = await getCustomerVolumes({
                    CustomerID: customerID,
                    PeriodID: resData.PeriodID,
                    PeriodTypeID: resData.PeriodTypeID,
                    VolumesToFetch: [2, 5, 6, 7, 8, 9]
                });
                let volume = {
                    Volume: volumeResponse
                };
                Commission = { ...volume };
            }

            let commissionSumQuery = `SELECT 
                                     SUM(CASE
                                         WHEN cd.BonusID = 5 OR cd.BonusID = 6 THEN pv.Volume2 * cd.Percentage / 100
                                         WHEN cd.BonusID = 7  THEN cd.CommissionAmount
                                         END) AS TeamCommissionTotal
                                    ,SUM(CASE
                                         WHEN cd.BonusID = 4  THEN pv.Volume2 * cd.Percentage / 100
                                         END) AS SavvySellerBonusTotal
                                    ,SUM(CASE
                                         WHEN cd.BonusID = 1  THEN cd.SourceAmount / er.Rate
                                         END) AS DeferredCommissionTotal              
                                FROM  CommissionDetails cd	
                                     INNER JOIN Customers c 
                                         ON c.CustomerID = cd.FromCustomerID
                                     INNER JOIN CommissionRuns cr
                                         ON cd.CommissionRunID = cr.CommissionRunID
                                     INNER JOIN PeriodVolumes pv 
                                         ON pv.CustomerID = cd.FromCustomerID AND cr.PeriodID = pv.PeriodID
                                     INNER JOIN CommissionExchangeRates er 
                                         ON er.CommissionRunID = cd.CommissionRunID AND cd.CurrencyCode = er.CurrencyCode
                                     INNER JOIN Bonuses b 
                                         ON b.BonusID = cd.BonusID
                                     WHERE
                                        cd.CustomerID = @customerid
                                        AND cd.CommissionRunID = @commissionrunid
                                        AND cd.BonusID IN (1,4,5,6,7)`;

            let commissionSumResult = await executeQuery({ SqlQuery: commissionSumQuery, SqlParams: params });
            let CommissionTotalVal = {
                TeamSum: 0,
                UsdSum: 0,
                CadSum: 0,
                SavvySum: 0
            };
            if (commissionSumResult.length > 0) {
                CommissionTotalVal.TeamSum = commissionSumResult[0].TeamCommissionTotal;
                CommissionTotalVal.UsdSum = commissionSumResult[0].DeferredCommissionTotal;
                CommissionTotalVal.SavvySum = commissionSumResult[0].SavvySellerBonusTotal;
            }

            Commission = { ...Commission, ...resData, ...CommissionTotalVal };
            return resolve(Commission);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}


/**
 * Get Historical Bonus Details
 * @returns Historical Bonus Details
 */
export const getHistoricalBonusDetails = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            const customerID = request.CustomerID;
            const commissionRunID = request.CommissionRunID;
            const pageSize = request.PageSize;
            const pageNo = request.PageNo;
            const bonusId = request.BonusID;

            var HistoricalBonusDetails = [];
            let resData = await getHistoricalBonus({ CommissionRunID: commissionRunID, CustomerID: customerID, BonusID: bonusId, PageSize: pageSize, PageNo: pageNo });

            if (resData.length > 0) {
                if (bonusId == constants.BonusTypes.DeferredCommission) {
                    for (var i = 0; i < resData.length; i++) {
                        let data = resData[i];
                        let req = {
                            CustomerID: data.FromCustomerID,
                            IncludeOrderDetails: false,
                            IncludePayments: false,
                            LanguageID: 0,
                            OrderID: data.OrderID,
                            OrderStatuses: [],
                            OrderTypes: [],
                            Page: 1,
                            RowCount: 50,
                            Skip: 0,
                            StartDate: null,
                            Take: 50,
                            TotalRowCount: 1
                        };
                        var orderRes = await getCustomerOrders(req);
                        if (orderRes != null && orderRes.Orders.length > 0) {
                            data.SourceAmount = orderRes.Orders[0].SubTotal;
                            data.Percentage = 25;
                            data.CommissionAmount = orderRes.Orders[0].Other1Total;
                            let CurrencyCode = {
                                CurrencyCode: orderRes.Orders[0].CurrencyCode.toUpperCase()
                            };
                            data = { ...data, ...CurrencyCode };
                        }
                        if (!data.CurrencyCode) {
                            let CurrencyCode = {
                                CurrencyCode: constants.CurrencyCode.US
                            };
                            data = { ...data, ...CurrencyCode };
                        }
                        HistoricalBonusDetails.push(data);
                    }
                }
                else {
                    HistoricalBonusDetails = resData;
                }
            }

            let result = {
                HistoricalBonusDetails: HistoricalBonusDetails
            };

            return resolve(result);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}


/**
 * Get Customer Realtime Commissions 
 * @param CustomerID
 * @param GetPeriodVolumes
 * @returns Customer Realtime Commissions 
 */
export const getCustomerRealTimeCommissions = async function (request) {
    const customerID = Number(request.CustomerID);
    return new Promise(async (resolve, reject) => {
        try {
            let RealTimeCommission = [];

            //realtime commission exigo api call
            let realTimeResponse = await getRealTimeCommissions(customerID);
            if (realTimeResponse.Commissions.length === 0) {
                const period = await getCurrentPeriod(constants.PeriodTypes.Default)
                if (period) {
                    var commission = {
                        CustomerID: customerID,
                        PeriodType: 1,
                        PeriodID: period.PeriodID,
                        PeriodDescription: '',
                        CurrencyCode: constants.CurrencyCode.US,
                        CommissionTotal: '',
                        Bonuses: []
                    };
                    realTimeResponse.Commissions.push(commission);
                }
            }

            if (realTimeResponse.Commissions.length === 0) {
                return resolve(RealTimeCommission);
            }

            if (request.GetPeriodVolumes) {
                let periodRequests = [];
                let periods = [];
                for (var i = 0; i < realTimeResponse.Commissions.length; i++) {
                    let commissionResponse = realTimeResponse.Commissions[i];

                    let periodID = commissionResponse.PeriodID;
                    let periodTypeID = commissionResponse.PeriodType;

                    let req = periodRequests.find(x => x.PeriodTypeID === periodTypeID)
                    if (req === null || req === undefined) {
                        periodRequests.push({
                            PeriodTypeID: periodTypeID,
                            PeriodIDs: [periodID]
                        })
                    }
                    else {
                        if (req.PeriodIDs.indexOf(periodID) <= -1)
                            req.PeriodIDs.push(periodID);
                    }
                }

                for (let pr = 0; pr < periodRequests.length; pr++) {
                    let periodResponse = await getPeriods(periodRequests[pr])
                    for (let period = 0; period < periodResponse.length; period++) {
                        periods.push(periodResponse[period]);
                    }
                }

                let volumes = [];

                for (let p = 0; p < periods.length; p++) {
                    let volumeResponse = await getCustomerVolumes({
                        CustomerID: customerID,
                        PeriodID: periods[p].PeriodID,
                        PeriodTypeID: periods[p].PeriodTypeID,
                        VolumesToFetch: [2, 5, 6, 7, 8, 9]
                    });

                    if (volumeResponse !== undefined) {
                        volumes.push(volumeResponse);
                    }
                }

                for (var i = 0; i < realTimeResponse.Commissions.length; i++) {
                    var data = realTimeResponse.Commissions[i];
                    let usdSum = 0, cadSum = 0, teamSum = 0, savvySum = 0;
                    if (data.Bonuses.length > 0) {
                        data.Bonuses.forEach((bonus) => {
                            let bonusId = Number(bonus.BonusID);
                            if (bonusId == constants.BonusTypes.DeferredCommission) {
                                usdSum += Number(bonus.Amount);
                            }
                            else if (bonusId == constants.BonusTypes.SavvySeller) {
                                savvySum += Number(bonus.Amount);
                            }
                            else {
                                teamSum += Number(bonus.Amount);
                            }
                        })
                    }
                    var resultData = {
                        TeamSum: teamSum,
                        UsdSum: usdSum,
                        CadSum: cadSum,
                        SavvySum: savvySum,
                        Commission: data,
                        Volume: {},
                        Period: {}
                    }
                    resultData.Volume = volumes.find(x => Number(x.PeriodTypeID) === Number(data.PeriodType) && Number(x.PeriodID) === Number(data.PeriodID));
                    resultData.Period = periods.find(p => Number(p.PeriodTypeID) === Number(data.PeriodType) && Number(p.PeriodID) === Number(data.PeriodID));
                    RealTimeCommission.push(resultData);
                }
            }
            else {
                const periodIds = realTimeResponse.Commissions.map(data => data.PeriodID);
                let periods = await getPeriods({ PeriodIDs: periodIds, PeriodTypeID: realTimeResponse.Commissions[0].PeriodType });

                realTimeResponse.Commissions.forEach(function (data, index) {
                    const period = periods.find(function (element) {
                        return (element.PeriodID === Number(data.PeriodID) && element.PeriodTypeID === Number(data.PeriodType))
                    });

                    if (period !== undefined) {
                        const periodData = {
                            PeriodID: period.PeriodID,
                            PeriodTypeID: period.PeriodTypeID,
                            PeriodDescription: period.PeriodDescription,
                            StartDate: period.StartDate,
                            EndDate: period.EndDate,
                            ActualEndDate: period.ActualEndDate
                        };
                        RealTimeCommission.push(periodData);
                    }
                })
            }
            return resolve(RealTimeCommission);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}

/**
 * Get RealTime Bonus Details
 * @param CustomerID
 * @param PeriodID
 * @param PeriodTypeID
 * @param BonusID
 * @returns RealTime Bonus Details
 */
export const getRealTimeBonusDetails = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            const periodId = request.PeriodID;
            const customerId = request.CustomerID;
            const periodTypeId = request.PeriodTypeID;
            const bonusId = request.BonusID;

            let RealTimeBonusDetails = [];

            //realtime commission details exigo api call
            let resData = await getRealTimeCommissionDetails(customerId, periodTypeId, periodId, bonusId);
            if (resData.length > 0) {
                if (bonusId == constants.BonusTypes.DeferredCommission) {
                    for (var i = 0; i < resData.length; i++) {
                        let detail = resData[i];
                        let req = {
                            CustomerID: detail.FromCustomerID,
                            IncludeOrderDetails: false,
                            IncludePayments: false,
                            LanguageID: 0,
                            OrderID: detail.OrderID,
                            OrderStatuses: [],
                            OrderTypes: [],
                            Page: 1,
                            RowCount: 50,
                            Skip: 0,
                            StartDate: null,
                            Take: 50,
                            TotalRowCount: 1
                        };
                        var orderRes = await getCustomerOrders(req);
                        if (orderRes !== null && orderRes !== undefined && orderRes.Orders.length > 0) {
                            detail.SourceAmount = orderRes.Orders[0].SubTotal;
                            detail.Percentage = 25;
                            let CurrencyCode = {
                                CurrencyCode: orderRes.Orders[0].CurrencyCode.toUpperCase()
                            };
                            detail = { ...detail, ...CurrencyCode };
                        }
                        if (!detail.CurrencyCode) {
                            let CurrencyCode = {
                                CurrencyCode: constants.CurrencyCode.US
                            };
                            detail = { ...detail, ...CurrencyCode };
                        }
                        RealTimeBonusDetails.push(detail);
                    }
                }
                else {
                    RealTimeBonusDetails = resData;
                }
            }

            let result = {
                RealTimeBonusDetails: RealTimeBonusDetails
            };
            return resolve(result);
        }
        catch (err) {
            console.log(err.message);
            // throw err;//TODO: Error log to be added
        }
    });
}


/**
 * Get Historical Bonus
 * @param CustomerID
 * @param CommissionRunID
 * @param PageSize
 * @param PageNo
 * @returns Customer Historical Bonus
 */
export const getHistoricalBonus = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let query = ` SELECT 
                               cd.BonusID
                              ,b.BonusDescription
                              ,cd.FromCustomerID
                              ,FromCustomerName = c.FirstName + ' ' + c.LastName
                              ,cd.Level
                              ,cd.PaidLevel
                              ,cd.Percentage
                              ,cd.OrderID
                           ,CASE
                               WHEN cd.BonusID = 4 OR cd.BonusID = 5 OR cd.BonusID = 6 THEN pv.Volume2
                               WHEN cd.BonusID = 8 THEN cd.SourceAmount / er.Rate
                               ELSE cd.SourceAmount
                               END AS SourceAmount
                           ,CASE
                               WHEN cd.BonusID = 4 OR cd.BonusID = 5 OR cd.BonusID = 6 THEN pv.Volume2 * cd.Percentage / 100
                               WHEN cd.BonusID = 1 OR cd.BonusID = 8 THEN cd.SourceAmount / er.Rate
                               ELSE cd.CommissionAmount
                               END AS CommissionAmount
                            FROM  CommissionDetails cd	
                               INNER JOIN Customers c 
                               ON c.CustomerID = cd.FromCustomerID
                            INNER JOIN CommissionRuns cr
                               ON cd.CommissionRunID = cr.CommissionRunID
                            INNER JOIN PeriodVolumes pv 
                               ON pv.CustomerID = cd.FromCustomerID AND cr.PeriodID = pv.PeriodID
                            INNER JOIN CommissionExchangeRates er 
                               ON er.CommissionRunID = cd.CommissionRunID AND cd.CurrencyCode = er.CurrencyCode
                            INNER JOIN Bonuses b 
                               ON b.BonusID = cd.BonusID
                            WHERE
                               cd.CustomerID = @customerid
                               AND cd.CommissionRunID = @commissionrunid
                               AND cd.BonusID = @bonusid
                               ORDER BY cd.FromCustomerID DESC`;

            let params = [
                {
                    Name: 'commissionrunid',
                    Type: sql.Int,
                    Value: request.CommissionRunID
                },
                {
                    Name: 'customerid',
                    Type: sql.BigInt,
                    Value: request.CustomerID
                },
                {
                    Name: 'bonusid',
                    Type: sql.Int,
                    Value: request.BonusID
                }
            ];

            let resData = await executeQuery({ SqlQuery: query, SqlParams: params, PageSize: Number(request.PageSize), PageNumber: Number(request.PageNo) });
            return resolve(resData);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}

/**
 * Get Current Commission
 * @param CustomerID
 * @param PeriodTypeID
 * @returns Current Commission
 */
export const getCurrentCommission = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            const customerId = request.CustomerID;
            const periodTypeId = request.PeriodTypeID;

            let query = `SELECT
                              pv.CustomerID
                             ,Total = c.Total
                             ,r.RankID
                             ,r.RankDescription
                             ,p.PeriodID
                             ,p.PeriodDescription
                         FROM PeriodVolumes AS pv
                             INNER JOIN Periods AS p 
                                   ON p.PeriodID = pv.PeriodID
                             JOIN CommissionRuns cr
                                   ON cr.PeriodID = p.PeriodID
                             JOIN Commissions c
                                   ON c.CommissionRunID = cr.CommissionRunID
                                   AND c.CustomerID = pv.CustomerID
                             INNER JOIN Ranks AS r 
                                   ON r.RankID = pv.PaidRankID
                         WHERE pv.CustomerID = @customerId
                                  AND pv.PeriodTypeId = @periodTypeId
                                  AND p.EndDate BETWEEN @periodStartDate  
                                  AND DATEADD(hh, -24, @periodEndDate)`;

            let params = [
                {
                    Name: 'customerId',
                    Type: sql.BigInt,
                    Value: customerId
                },
                {
                    Name: 'periodTypeId',
                    Type: sql.Int,
                    Value: periodTypeId
                },
                {
                    Name: 'periodStartDate',
                    Value: constants.CommissionStartDate
                },
                {
                    Name: 'periodEndDate',
                    Value: constants.CommissionStartDate
                }
            ];

            let responseData = await executeQuery({ SqlQuery: query, SqlParams: params });
            return resolve(responseData);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}






