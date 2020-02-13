/** File Name : Customer.js
 * Description :  To get customer
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 12th Feb 2020
 */

import sql from 'mssql';
import { executeQuery } from '../../db/mssql';
import * as constants from '../../common/constant';


/**
 * Get Customers 
 * @param CustomerID
 * @param PageSize
 * @param PageNo
 * @param IsCount
 * @param SortName
 * @param SortOrder
 * @param SearchData
 * @returns Customers
 */
export const getCustomers = function (request) {
    const promise = new Promise(async (resolve, reject) => {
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

    });
    return promise;
}

/**
 * Get Customer 
 * @param CustomerID
 * @returns Customer
 */
export const getCustomer = function (customerID, periodId) {
    const promise = new Promise(async (resolve, reject) => {
        let query = `SELECT c.CustomerID
        ,c.FirstName
        ,c.MiddleName
        ,c.LastName
        ,c.NameSuffix
        ,c.Company
        ,c.CustomerTypeID
        ,c.CustomerStatusID
        ,Email = c.LoginName
        ,PrimaryPhone = c.Phone
        ,SecondaryPhone = c.Phone2
        ,c.MobilePhone
        ,c.Fax
        ,c.CanLogin
        ,c.LoginName
        ,c.PasswordHash
        ,c.RankID
        ,RecongnitionRankID = (SELECT Max(pv.PaidRankID) from PeriodVolumes pv where pv.CustomerID = @CustomerID  AND ((((@PeriodID - 1) / 3) * 3) + -2)  <= pv.PeriodID AND @PeriodID >= pv.PeriodID)
        ,c.EnrollerID
        ,c.SponsorID
        ,c.BirthDate
        ,c.CurrencyCode
        ,c.PayableToName
        ,c.DefaultWarehouseID
        ,c.PayableTypeID
        ,c.CheckThreshold
        ,c.LanguageID
        ,c.Gender
        ,c.TaxCode
        ,c.TaxCodeTypeID
        ,c.IsSalesTaxExempt
        ,c.SalesTaxCode
        ,c.SalesTaxExemptExpireDate
        ,c.VatRegistration
        ,c.BinaryPlacementTypeID
        ,c.UseBinaryHoldingTank
        ,c.IsInBinaryHoldingTank
        ,c.IsEmailSubscribed
        ,c.EmailSubscribeIP
        ,c.Notes
        ,c.Field2
        ,c.Field3
        ,c.Field4
        ,c.Field5
        ,c.Field6
        ,c.Field7
        ,c.Field8
        ,c.Field9
        ,c.Field10
        ,c.Field11
        ,c.Field12
        ,c.Field13
        ,c.Field14
        ,c.Field15
        ,c.Date1
        ,c.Date2
        ,c.Date3
        ,c.Date4
        ,c.Date5
        ,c.CreatedDate
        ,c.ModifiedDate
        ,c.CreatedBy
        ,c.ModifiedBy
        ,cs.CustomerStatusDescription
        ,ct.CustomerTypeDescription
        ,MainAddress = c.MainAddress1 +' '+ c.MainAddress2 +' '+ c.MainAddress3
        ,c.MainCity
        ,c.MainState
        ,c.MainZip
        ,c.MainCountry
        ,c.MainCounty
        ,MailAddress = c.MailAddress1+' ' + c.MailAddress2 +' '+ c.MailAddress3
        ,c.MailCity
        ,c.MailState
        ,c.MailZip
        ,c.MailCountry
        ,c.MailCounty
        ,OtherAddress = c.OtherAddress1 +' '+ c.OtherAddress2 +' '+ c.OtherAddress3
        ,c.OtherCity
        ,c.OtherState
        ,c.OtherZip
        ,c.OtherCountry
        ,c.OtherCounty
FROM Customers c
  LEFT JOIN CustomerStatuses cs
      ON c.CustomerStatusID = cs.CustomerStatusID
  LEFT JOIN CustomerTypes ct
      ON c.CustomerTypeID = ct.CustomerTypeID
WHERE c.CustomerID = @CustomerID`;

        let params = [
            {
                Name: 'CustomerID',
                Type: sql.BigInt,
                Value: customerID
            },
            {
                Name: 'PeriodID',
                Type: sql.BigInt,
                Value: periodId
            }
        ];
        let resData = await executeQuery({ SqlQuery: query, SqlParams: params });
        return resolve(resData.length > 0 ? resData[0] : '');
    });
    return promise;
}

/**
 * Get Customer 
 * @param CustomerID
 * @returns Customer
 */
export const isCustomerActive = function (customerId, periodId) {
    const promise = new Promise(async (resolve, reject) => {
        if (customerId > 0) {
            let quart = await quarter(periodId);
            let query = `Select 
            CASE WHEN (Select sum(x.Volume2) from PeriodVolumes x WHERE x.CustomerID = @currentCustomerID AND PeriodID BETWEEN @quarterStartID AND @quarterEndID) < 150 THEN
              CASE WHEN c.Date1 > (Select px.StartDate from Periods px where px.PeriodID = @quarterStartID) THEN 'true' ELSE 'false' END
              ELSE 'true' 
            END as IsActive
            from Customers c  
            where c.CustomerID = @currentCustomerID`;
            let params = [
                {
                    Name: 'currentCustomerID',
                    Type: sql.BigInt,
                    Value: customerId
                },
                {
                    Name: 'quarterStartID',
                    Type: sql.BigInt,
                    Value: quart.StartPeriodID
                },
                {
                    Name: 'quarterEndID',
                    Type: sql.BigInt,
                    Value: quart.EndPeriodID
                }

            ];
            let resData = await executeQuery({ SqlQuery: query, SqlParams: params });
            return resolve(resData.length > 0 ? (resData[0].IsActive == 'true' ? true : false) : false);
        }
        return resolve(false);
    });
    return promise;
}


const quarter = async function (periodId) {
    const currentPeriodID = periodId
    const quarterYear = (periodId / 12) + 2017;
    const quarterID = ((periodId - 1) / 3);
    const startPeriodID = (quarterID * 3) + 1;
    const endPeriodID = startPeriodID + 2;
    return ({
        CurrentPeriodID: currentPeriodID,
        QuarterYear: quarterYear,
        QuarterID: quarterID,
        StartPeriodID: startPeriodID,
        EndPeriodID: endPeriodID
    })
}



/**
 * Get Customer 
 * @param CustomerID
 * @returns Customer
 */
export const isCustomerInEnrollerDownline = function (customerId, id) {
    const promise = new Promise(async (resolve, reject) => {
        let query = `SELECT TOP 1
                                  d.CustomerID	
                                FROM
                                  EnrollerDownline d
                                WHERE
                                  d.DownlineCustomerID = @topcustomerID    
                                  AND d.CustomerID = @customerid`;
        let params = [
            {
                Name: 'topcustomerID',
                Type: sql.BigInt,
                Value: customerId
            },
            {
                Name: 'customerid',
                Type: sql.BigInt,
                Value: id
            }
        ];
        let resData = await executeQuery({ SqlQuery: query, SqlParams: params });
        return resolve(resData.length > 0 ? true : false);
    });
    return promise;
}