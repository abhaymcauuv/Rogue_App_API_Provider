/** File Name : Report.js
 * Description :  To get reports
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 12th Feb 2020
 */
import sql from 'mssql';
import { executeQuery } from '../../db/mssql';
import { getCustomer, isCustomerActive, getCustomerRecentActivity } from '../customer/customer';
import { getCustomerVolumes } from '../volume/volume';
import * as constants from '../../common/constant';
import { getCurrentPeriod } from '../period/period';
import { isCustomerInEnrollerDownline } from '../Tree/tree';
import { getRanks, getCustomerRankQualifications } from '../rank/rank';

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
export const getCustomerList = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            const customerTypes = [
                constants.CustomerTypes.RetailCustomer,
                constants.CustomerTypes.PreferredCustomer
            ];

            let searchText = '';
            if (request.SearchData) {
                searchText = "AND ( o.CustomerID like '" + request.SearchData + "%' OR c.MainAddress1 like '" + request.SearchData + "%' OR c.FirstName like '" + request.SearchData + "%' OR c.LastName like '" + request.SearchData + "%' OR c.LoginName like '" + request.SearchData + "%' OR c.Phone like '" + request.SearchData + "%')";
            }

            let sortText = 'Order by CustomerID';
            if (request.SortName && request.SortOrder) {
                sortText = 'Order by ' + request.SortName + ' ' + request.SortOrder;
            }
            let query = `SELECT DISTINCT
                            [CustomerID] = o.CustomerID
                          , [CustomerName] = c.FirstName + ' ' + c.LastName
                          , [Email] = c.LoginName
                          , [Phone] = c.Phone
                          , [Address] = c.MainAddress1
                          , City
                          , State
                          , Country
                     FROM[Orders] AS o
                          INNER JOIN Customers AS c ON c.CustomerID = o.CustomerID
                          WHERE
                          c.CustomerTypeID IN(${ customerTypes})
                          AND
                          o.Other14 = CAST(@customerId AS NVARCHAR(200))
                          ${searchText} 
                          ${ sortText} `;

            let params = [
                {
                    Name: 'customerId',
                    Type: sql.BigInt,
                    Value: request.CustomerID
                }
            ];

            let resData = await executeQuery({ SqlQuery: query, SqlParams: params, PageSize: Number(request.PageSize), PageNumber: Number(request.PageNo) });

            let noOfCustomer = 0;
            if (!request.IsCount) {
                let countQuery = ` SELECT COUNT(CustomerID) as customers
                                 FROM(SELECT DISTINCT
                                    [CustomerID] = o.CustomerID
                                  , [CustomerName] = c.FirstName + ' ' + c.LastName
                                  , [Email] = c.LoginName
                                  , [Phone] = c.Phone
                                  , [Address] = c.MainAddress1
                                  , City
                                  , State
                                  , Country
                                    FROM[Orders] AS o
                                        INNER JOIN Customers AS c ON c.CustomerID = o.CustomerID
                                    WHERE
                                         c.CustomerTypeID IN(${customerTypes})
                                         AND
                                         o.Other14 = CAST(@customerId  AS NVARCHAR(200))
                                    ${searchText}) as dt`;

                let res = await executeQuery({ SqlQuery: countQuery, SqlParams: params });
                noOfCustomer = res.length > 0 ? res[0].customers : 0
            }
            return resolve({ "Customers": resData, "Count": noOfCustomer });
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}

/**
 * Get Customer Details
 * @param CustomerID
 * @param ID
 * @returns Customer Details
 */
export const getCustomerDetails = function (id, customerId) {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {
                Customer: {},
                IsDistributor: false
            };

            const period = await getCurrentPeriod(constants.PeriodTypes.Default);
            const periodId = Number(period.PeriodID);

            response.Customer = await getCustomer(id, periodId);

            let isDistributor = Number(response.Customer.CustomerTypeID) == constants.CustomerTypes.Distributor || Number(response.Customer.CustomerTypeID) == constants.CustomerTypes.D2C;
            response.IsDistributor = isDistributor;
            if (isDistributor) {
                response.Volumes = await getCustomerVolumes({
                    CustomerID: id,
                    PeriodTypeID: constants.PeriodTypes.Default,
                    PeriodID: periodId,
                    VolumesToFetch: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                });
                response.IsActive = await isCustomerActive(id, periodId);

                if (Number(response.Customer.EnrollerID) > 0) {
                    response.Enroller = await getCustomer(Number(response.Customer.EnrollerID), periodId);
                    if (Number(response.Customer.EnrollerID) == Number(response.Customer.SponsorID)) {
                        response.Sponsor = response.Enroller;
                    }
                    else {
                        if (Number(response.Customer.SponsorID) > 0) {
                            response.Sponsor = await getCustomer(Number(response.Customer.SponsorID), periodId);
                        }
                    }
                }

                if (Number(response.Customer.RankID) == 0) {
                    response.Customer.RankID = response.Volumes ? response.Volumes.RankID[0] : 0;
                }

                if (Number(response.Customer.EnrollerID) != customerId && Number(response.Customer.CustomerID) != customerId) {
                    response.IsInEnrollerTree = await isCustomerInEnrollerDownline(customerId, Number(response.Customer.CustomerID));
                }
            }
            return resolve(response);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
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
export const getOrderList = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let sortText = 'Order by OrderDate DESC';
            if (request.SortName && request.SortOrder) {
                sortText = 'Order by ' + request.SortName + ' ' + request.SortOrder;
            }
            let query = `Select
                      o.OrderDate
                    , CountryCode = o.Country
                    , o.CurrencyCode
                    , o.OrderID
                    , o.SubTotal
                    , o.BusinessVolumeTotal
                    , o.CommissionableVolumeTotal
                  FROM Orders o
                    LEFT JOIN unileveldownline ud WITH (nolock)
                    ON o.CustomerID = ud.customerid AND ud.downlinecustomerid = @designerid
                    WHERE o.CustomerID = @customerid AND o.OrderStatusID >= @orderstatus
                    AND ((ud.downlinecustomerid = @designerid AND (o.PriceTypeID = 3 OR (o.BusinessVolumeTotal = 0 AND o.other14 = ''))) OR (o.PriceTypeID IN (1, 2) AND o.other14 = @designerid))
                    ${sortText}`;

            let params = [
                {
                    Name: 'customerid',
                    Type: sql.BigInt,
                    Value: request.ID
                },
                {
                    Name: 'designerid',
                    Type: sql.BigInt,
                    Value: request.CustomerID
                },
                {
                    Name: 'orderstatus',
                    Type: sql.BigInt,
                    Value: constants.OrderStatuses.Accepted
                }
            ];

            let resData = await executeQuery({ SqlQuery: query, SqlParams: params, PageSize: Number(request.PageSize), PageNumber: Number(request.PageNo) });

            let noOfOrders = 0;
            if (!request.IsCount) {
                let countQuery = `Select count(o.OrderID) as orders
                                        FROM Orders o
                                        LEFT JOIN unileveldownline ud WITH (nolock)
                                        ON o.CustomerID = ud.customerid AND ud.downlinecustomerid = @designerid
                                        WHERE o.CustomerID = @customerid AND o.OrderStatusID >= @orderstatus
                                        AND ((ud.downlinecustomerid = @designerid AND (o.PriceTypeID = 3 OR (o.BusinessVolumeTotal = 0 AND o.other14 = ''))) OR (o.PriceTypeID IN (1, 2) AND o.other14 = @designerid))`;

                let res = await executeQuery({ SqlQuery: countQuery, SqlParams: params });
                noOfOrders = res.length > 0 ? res[0].orders : 0
            }
            return resolve({ "Orders": resData, "Count": noOfOrders });
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}

/**
 * Get AutoOrders 
 * @param CustomerID
 * @param ID
 * @param PageSize
 * @param PageNo
 * @param IsCount
 * @param SortName
 * @param SortOrder
 * @returns AutoOrders
 */
export const getAutoOrderList = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let sortText = 'Order by AutoOrderID';
            if (request.SortName && request.SortOrder) {
                sortText = 'Order by ' + request.SortName + ' ' + request.SortOrder;
            }
            let query = `Select ao.AutoOrderID
                          , CountryCode = ao.Country
                          , ao.CurrencyCode
                          , ao.StartDate
                          , ao.LastRunDate
                          , ao.NextRunDate
                          , ao.SubTotal
                          , ao.BusinessVolumeTotal
                          , ao.CommissionableVolumeTotal                    
                       From AutoOrders ao
                           LEFT JOIN unileveldownline ud WITH (nolock)
                           ON ao.CustomerID = ud.customerid AND ud.downlinecustomerid = @designerid
                           WHERE ao.CustomerID = @customerid AND ao.AutoOrderStatusID = @autoorderstatus AND (ud.downlinecustomerid = @designerid OR ao.other14 = @designerid)
                           ${sortText}`;

            let params = [
                {
                    Name: 'customerid',
                    Type: sql.BigInt,
                    Value: request.ID
                },
                {
                    Name: 'designerid',
                    Type: sql.BigInt,
                    Value: request.CustomerID
                },
                {
                    Name: 'autoorderstatus',
                    Type: sql.BigInt,
                    Value: 0
                }
            ];

            let resData = await executeQuery({ SqlQuery: query, SqlParams: params, PageSize: Number(request.PageSize), PageNumber: Number(request.PageNo) });

            let noOfAutoOrders = 0;
            if (!request.IsCount) {
                let countQuery = `Select count(ao.AutoOrderID) as autoorders
                                     From AutoOrders ao
                                     LEFT JOIN unileveldownline ud WITH (nolock)
                                     ON ao.CustomerID = ud.customerid AND ud.downlinecustomerid = @designerid
                                     WHERE ao.CustomerID = @customerid AND ao.AutoOrderStatusID = @autoorderstatus AND (ud.downlinecustomerid = @designerid OR ao.other14 = @designerid)`;

                let res = await executeQuery({ SqlQuery: countQuery, SqlParams: params });
                noOfAutoOrders = res.length > 0 ? res[0].autoorders : 0;
            }
            return resolve({ "AutoOrders": resData, "Count": noOfAutoOrders });
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}

/**
 * Get Club Couture Customers 
 * @param CustomerID
 * @param PageSize
 * @param PageNo
 * @param IsCount
 * @param SortName
 * @param SortOrder
 * @param SearchData
 * @param IncludeClosedAccounts
 * @returns ClubCoutureCustomers
 */
export const getClubCoutureCustomerList = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let customerStatus = [
                constants.CustomerStatuses.Active
            ];

            let customerTypes = [
                constants.CustomerTypes.PreferredCustomer,
                constants.CustomerTypes.D2C
            ];

            if (request.IncludeClosedAccounts) {
                customerStatus = [
                    constants.CustomerStatuses.Active,
                    constants.CustomerStatuses.Terminated,
                    constants.CustomerStatuses.Paused
                ];

                customerTypes = [
                    constants.CustomerTypes.PreferredCustomer,
                    constants.CustomerTypes.RetailCustomer,
                    constants.CustomerTypes.D2C
                ]
            }

            let searchText = '';
            if (request.SearchData) {
                searchText = "AND (CustomerID like '" + request.SearchData + "%' OR Address like '" + request.SearchData + "%' OR CustomerName like '" + request.SearchData + "%'  OR Email like '" + request.SearchData + "%' OR Phone like '" + request.SearchData + "%')";
            }

            let sortText = 'ORDER By JoinDate DESC';
            if (request.SortName && request.SortOrder) {
                sortText = 'Order by ' + request.SortName + ' ' + request.SortOrder;
            }

            let query = `Select * From(Select distinct
                             c.CustomerID as CustomerID
                            ,c.CustomerTypeID
                            ,c.FirstName + ' ' + c.LastName as CustomerName
                            ,c.Email as Email
                            ,c.Phone as Phone
                            ,ao.Other15
                            ,CASE WHEN c.CustomerTypeID = 1 THEN 'Cancelled'
                                  ELSE cs.CustomerStatusDescription 
                                  END as CustomerStatusDescription
                            ,ao.CreatedDate as JoinDate
                            ,max(ao.CancelledDate) as EndDate
                            ,(select count(OrderID) from Orders where AutoOrderID = ao.AutoOrderID and OrderStatusID in (7,8,9) ) as NumberShipmentsReceived
                            ,[Address] = o.Address1
                            ,o.City
                            ,o.State
                            ,o.Country
                            ,ROW_NUMBER() OVER(PARTITION BY c.CustomerID ORDER BY o.OrderID DESC) rownumber
                             from Customers c with (nolock)
                             left join Orders o on o.CustomerID = c.CustomerID AND o.AutoOrderID IS Not NULL
                             left join AutoOrders ao with (nolock) on c.CustomerID = ao.CustomerID
                             join CustomerStatuses cs with (nolock) on cs.CustomerStatusID = c.CustomerStatusID
                             where ao.Other14 = CAST(@customerId as NVARCHAR(200)) and c.CustomerTypeID IN (${customerTypes}) and cs.CustomerStatusID IN (${customerStatus}) and ao.Other15 = 1
                             group by c.CustomerID, c.FirstName, c.LastName, c.Email, c.Phone, ao.Other15, cs.CustomerStatusDescription, ao.AutoOrderID, ao.CreatedDate, o.Address1, o.City,o.State,o.Country, o.CustomerID, o.OrderID, c.CustomerTypeID) a
                             Where a.rownumber = 1 ${searchText}
                             ${sortText}`;

            let params = [
                {
                    Name: 'customerId',
                    Type: sql.BigInt,
                    Value: request.CustomerID
                }
            ];

            let resData = await executeQuery({ SqlQuery: query, SqlParams: params, PageSize: Number(request.PageSize), PageNumber: Number(request.PageNo) });

            let noOfCustomer = 0;
            if (!request.IsCount) {
                let countQuery = `SELECT COUNT(CustomerID) as customers from (Select * From ( Select distinct
                                 c.CustomerID as CustomerID
                                ,c.FirstName + ' ' + c.LastName as CustomerName
                                ,c.Email as Email
                                ,c.Phone as Phone
                                ,[Address] = o.Address1
                                ,ROW_NUMBER() OVER(PARTITION BY c.CustomerID ORDER BY o.OrderID DESC) rownumber
                                   from Customers c with (nolock)
                                   left join Orders o on o.CustomerID = c.CustomerID AND o.AutoOrderID IS Not NULL
                                   left join AutoOrders ao with (nolock) on c.CustomerID = ao.CustomerID
                                   join CustomerStatuses cs with (nolock) on cs.CustomerStatusID = c.CustomerStatusID
                                   where ao.Other14 = CAST(@CustomerID as NVARCHAR(200)) and c.CustomerTypeID IN (${customerTypes}) and cs.CustomerStatusID IN (${customerStatus}) and ao.Other15 = 1
                                   group by c.CustomerID, c.FirstName, c.LastName, c.Email, c.Phone, ao.Other15, cs.CustomerStatusDescription, ao.AutoOrderID, ao.CreatedDate, o.Address1, o.City,o.State,o.Country, o.CustomerID, o.OrderID, c.CustomerTypeID) a
                                   Where a.rownumber = 1 ${searchText}
                )as dt`;

                let res = await executeQuery({ SqlQuery: countQuery, SqlParams: params });
                noOfCustomer = res.length > 0 ? res[0].customers : 0
            }
            return resolve({ "ClubCoutureCustomers": resData, "Count": noOfCustomer });
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}

/**
 * Get Customer's Recent Activity 
 * @param CustomerID
 * @returns  Customer's Recent Activity 
 */
export const getActivity = function (customerId) {
    return new Promise(async (resolve, reject) => {
        try {
            let customerActivities = await getCustomerRecentActivity({ CustomerID: customerId });
            if (customerActivities.length > 0) {
                customerActivities = customerActivities.sort((a, b) => new Date(b.EntryDate) - new Date(a.EntryDate));
            }
            return resolve(customerActivities);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
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
export const getVolumesList = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let sortText = 'Order by StartDate';
            if (request.SortName && request.SortOrder) {
                sortText = 'Order by ' + request.SortName + ' ' + request.SortOrder;
            }
            let query = `SELECT  
                          p.PeriodID
                        , p.StartDate
                        , p.EndDate
                        , p.PeriodDescription
                        , r.RankDescription
                        , pv.PaidRankID
                        , pv.Volume1
                        , pv.Volume2
                        , pv.Volume3
                        , pv.Volume4
                        , pv.Volume5
                    FROM Customers c
                        INNER JOIN Periods p
                        ON dateadd(day, 1, p.EndDate) > c.Date1
                        AND p.PeriodTypeID = @periodtype
                        AND p.StartDate <= GETDATE()
                    INNER JOIN PeriodVolumes pv
                        ON pv.PeriodID = p.PeriodID
                        AND pv.PeriodTypeID = p.PeriodTypeID
                        AND pv.CustomerID = c.CustomerID
                    LEFT JOIN Ranks r 
                        ON r.RankID = pv.PaidRankID
                        WHERE c.CustomerID = @customerid
                    ${sortText}`;

            let params = [
                {
                    Name: 'customerid',
                    Type: sql.BigInt,
                    Value: request.ID
                },
                {
                    Name: 'periodtype',
                    Type: sql.BigInt,
                    Value: constants.PeriodTypes.Default
                }
            ];

            let resData = await executeQuery({ SqlQuery: query, SqlParams: params, PageSize: Number(request.PageSize), PageNumber: Number(request.PageNo) });

            let noOfVolumes = 0;
            if (!request.IsCount) {
                let countQuery = `SELECT count(p.PeriodID) as volumes
                                     FROM Customers c
                                          INNER JOIN Periods p
                                          ON dateadd(day, 1, p.EndDate) > c.Date1
                                          AND p.PeriodTypeID = @periodtype
                                          AND p.StartDate <= GETDATE()
                                      INNER JOIN PeriodVolumes pv
                                          ON pv.PeriodID = p.PeriodID
                                          AND pv.PeriodTypeID = p.PeriodTypeID
                                          AND pv.CustomerID = c.CustomerID
                                      LEFT JOIN Ranks r 
                                          ON r.RankID = pv.PaidRankID
                                          WHERE c.CustomerID = @customerid`;

                let res = await executeQuery({ SqlQuery: countQuery, SqlParams: params });
                noOfVolumes = res.length > 0 ? res[0].volumes : 0;
            }
            return resolve({ "Volumes": resData, "Count": noOfVolumes });
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}

/**
 * Get Rank Advancement
 * @param ID
 * @returns Rank Advancement
 */
export const getRankAdvancement = function (customerId) {
    return new Promise(async (resolve, reject) => {
        try {
            const period = await getCurrentPeriod(constants.PeriodTypes.Default);
            const periodId = Number(period.PeriodID);
            const periodTypeId = Number(period.PeriodTypeID);

            let query = `SELECT 
                       ISNULL(pv.PaidRankID, 1) as PaidRankID
                     FROM
                       PeriodVolumes pv		                            
                    WHERE pv.CustomerID = @customerid
                       AND pv.PeriodTypeID = @periodtypeid
                       AND pv.PeriodID = @periodid`;

            let params = [
                {
                    Name: 'customerid',
                    Type: sql.BigInt,
                    Value: customerId
                },
                {
                    Name: 'periodtypeid',
                    Type: sql.BigInt,
                    Value: periodTypeId
                },
                {
                    Name: 'periodid',
                    Type: sql.BigInt,
                    Value: periodId
                }
            ];

            let resData = await executeQuery({ SqlQuery: query, SqlParams: params });
            let result = resData.length > 0 ? Number(resData[0].PaidRankID) : 0;
            let paidRankID = 1;
            if (result > 0) {
                paidRankID = result;
            }

            let ranks = await getRanks();
            if (ranks.length > 0) {
                if (Number(ranks[ranks.length - 1].RankID) != paidRankID) {
                    let paidRank = ranks.find(r => Number(r.RankID) > paidRankID);
                    paidRankID = Number(paidRank.RankID);
                }
            }

            let qualification = await getCustomerRankQualifications({ CustomerID: customerId, RankID: paidRankID })
            return resolve(qualification);
        }
        catch (err) {
            console.log(err.message);
            //throw err;//TODO:Error log to be added
        }
    });
}



