/** File Name : Tree.js
 * Description :  To get tree data
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 15th Feb 2020
 */

import sql from 'mssql';
import { executeQuery } from '../../db/mssql';
import * as constants from '../../common/constant';

/**
 * Check CustomerInEnrollerDownline 
 * @param CustomerID
 * @param ID
 * @returns IsCustomerInEnrollerDownline
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



