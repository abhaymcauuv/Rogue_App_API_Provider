/** File Name : Item.js
 * Description :  To get items
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 2nd Mar 2020
 */

import sql from 'mssql';
import { executeQuery } from '../../db/mssql';

/**
 * Get Web Category 
 * @param WebCategoryID
 * @param WebID
 * @returns Web Category
 */
export const getWebCategory = function (webCategoryID, webID) {
    const promise = new Promise(async (resolve, reject) => {
        let query = `;WITH webcat (WebCategoryID, WebCategoryDescription, ParentID, NestedLevel, SortOrder) 
                     AS (SELECT WebCategoryID, 
                         WebCategoryDescription, 
                         ParentID = COALESCE(ParentID, 0), 
                         NestedLevel,
                         SortOrder
                     FROM  WebCategories 
                         WHERE  WebCategoryID = @webcategoryid
                         AND WebID = @webid 
                     UNION ALL 
                     SELECT w.WebCategoryID, 
                            w.WebCategoryDescription, 
                            w.ParentID, 
                            w.NestedLevel,
                            w.SortOrder
                     FROM   WebCategories w 
                            INNER JOIN webcat c 
                            ON c.WebCategoryID = w.ParentID) 
                     SELECT * 
                            FROM webcat`;

        let params = [
            {
                Name: 'webcategoryid',
                Type: sql.BigInt,
                Value: webCategoryID
            },
            {
                Name: 'webid',
                Type: sql.BigInt,
                Value: webID
            }
        ];
        let resData = await executeQuery({ SqlQuery: query, SqlParams: params });
        return resolve(resData);
    });
    return promise;
}





