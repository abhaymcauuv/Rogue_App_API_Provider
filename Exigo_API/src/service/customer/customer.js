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
 * Get Customer 
 * @param CustomerID
 * @param PeriodID
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
        ,RankDescription =(select top 1 RankDescription from Ranks where RankID = c.RankID)
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
 * @param PeriodID
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
 * Get Customer's Recent Activity 
 * @param CustomerID
 * @param StartDate
 * @returns  Customer's Recent Activity 
 */
export const getCustomerRecentActivity = function (request) {
    const promise = new Promise(async (resolve, reject) => {
        let query = `DECLARE @CW TABLE 
                            ( 
                              CustomerWallItemID int NOT NULL, 
                              CustomerID int NOT NULL, 
                              EntryDate datetime, 
                              Text varchar(100), 
                              OrderID int , 
                              Field1 varchar(20), 
                              Field2 varchar(20), 
                              Field3 varchar(20)
                            ) 
                        INSERT INTO @CW (CustomerWallItemID, CustomerID, EntryDate, Text, OrderID, Field1, Field2, Field3)
                        SELECT top 30 [CustomerWallItemID]
                                      ,cw.CustomerID
                                      ,[EntryDate]
                                      ,[Text]
                                      ,(select SUBSTRING(Text,CHARINDEX('[',Text)+1,CHARINDEX(']',Text)-CHARINDEX('[',Text)-1) where Text Like '%].') as OrderID
                                      ,[Field1]
                                      ,[Field2]
                                      ,[Field3]
                                FROM CustomerWall cw 
                                     Where cw.CustomerID=@CustomerID
                                     and EntryDate > DATEADD(month, -2, GETDATE())
                                Order by EntryDate Desc
                                Select c.* from @CW c inner join Orders o on o.OrderID = c.OrderID 
                                inner join Customers cu on cu.CustomerID = o.CustomerID  where c.OrderID not in (
                                Select top 500 OrderID from Orders o where o.OrderTypeID = 4 and o.OrderID in (SELECT OrderID from @CW)) and cu.CustomerTypeID = @CustomerTypeID`;
        let params = [
            {
                Name: 'CustomerID',
                Type: sql.BigInt,
                Value: request.CustomerID
            },
            {
                Name: 'CustomerTypeID',
                Type: sql.BigInt,
                Value: constants.CustomerTypes.Distributor
            }
        ];

        let resData = await executeQuery({ SqlQuery: query, SqlParams: params });
        if (request.StartDate && resData.length > 0) {
            resData = resData.filter(c => new Date(c.EntryDate) >= new Date(request.StartDate)).ToList();
        }
        return resolve(resData);
    });
    return promise;
}





