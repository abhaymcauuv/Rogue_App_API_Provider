/** File Name : mssql.js
 * Description : for sql execute query
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 31st Jan 2020
 */

import sql from 'mssql';
import { poolPromise } from './dbconnection';

/**
 *  Execute query with paging if available
 */
export const executeQuery = async function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            const pool = await poolPromise;
            let req = await pool.request();
            if (request.PageSize !== undefined && request.PageSize > 0) {
                request.SqlQuery = request.SqlQuery + `
                    OFFSET  @PageSize * (@PageNumber - 1) ROWS
                    FETCH NEXT  @PageSize ROWS ONLY`
                req.input("PageSize", sql.Int, request.PageSize);
                req.input("PageNumber", sql.Int, request.PageNumber);
            }
            if (request.SqlParams !== undefined) {
                request.SqlParams.forEach(function (param) {
                    if (param.Type !== undefined) {
                        req.input(param.Name, param.Type, param.Value);
                    }
                    else {
                        req.input(param.Name, param.Value);
                    }
                })
            }
            let response = await req.query(request.SqlQuery);
            let result = response.recordset;
            return resolve(result);
        }
        catch (err) {
            console.log(err.message);
            //throw err
        }
    });
}









