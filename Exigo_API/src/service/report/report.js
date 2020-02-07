/** File Name : Report.js
 * Description :  To get reports
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 6th Feb 2020
 */
import sql from 'mssql';
import { executeQuery } from '../../db/mssql';
import * as constants from '../../common/constant';

export const getCustomerList = function (request) {
    const promise = new Promise(async (resolve, reject) => {
        const customerTypes = [
            constants.CustomerTypes.RetailCustomer,
            constants.CustomerTypes.PreferredCustomer
        ]
        let query = `SELECT DISTINCT
                            [CustomerID] = o.CustomerID
                           ,[CustomerName] = c.FirstName + ' ' + c.LastName
                           ,[Email] = c.LoginName
                           ,[Phone] = c.Phone
                           ,[Address] = c.MainAddress1
                           ,City
                           ,State
                           ,Country
                        FROM [Orders] AS o
                            INNER JOIN Customers AS c ON c.CustomerID = o.CustomerID
                        WHERE
                             c.CustomerTypeID IN (${customerTypes})
                             AND
                             o.Other14 = CAST(@customerId AS NVARCHAR(200))
                             Order by o.CustomerID`;

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
            let countQuery = ` SELECT COUNT(*) as customers
                                 FROM (SELECT DISTINCT
                                        [CustomerID] = o.CustomerID
                                       ,[CustomerName] = c.FirstName + ' ' + c.LastName
                                       ,[Email] = c.LoginName
                                       ,[Phone] = c.Phone
                                       ,[Address] = c.MainAddress1
                                       ,City
                                       ,State
                                      ,Country
                                    FROM [Orders] AS o
                                        INNER JOIN Customers AS c ON c.CustomerID = o.CustomerID
                                    WHERE
                                         c.CustomerTypeID IN (${customerTypes})
                                         AND
                                         o.Other14 = CAST(@customerId  AS NVARCHAR(200))
                                         ) as dt`;

            let res = await executeQuery({ SqlQuery: countQuery, SqlParams: params });
            noOfCustomer = res.length > 0 ? res[0].customers : 0
        }
        return resolve({ "Customers": resData, "Count": noOfCustomer });

    });
    return promise;
}
