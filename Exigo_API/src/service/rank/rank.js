/** File Name : Rank.js
 * Description :  for Ranks 
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 15th Feb 2020
 */
import sql from 'mssql';
import { executeQuery } from '../../db/mssql';

/**
 * Get Ranks
 * @returns Ranks
 */
export const getRanks = function () {
    return new Promise(async (resolve, reject) => {
        let query = `SELECT r.RankID, r.RankDescription FROM Ranks r ORDER BY RankID`;
        let params = [];
        let ranks = await executeQuery({ SqlQuery: query, SqlParams: params });
        if (ranks.length > 0) {
            let checkRankZero = ranks.filter(r => Number(r.RankID) == 0);
            if (checkRankZero.length == 0) {
                ranks.push({ RankID: 0, RankDescription: "" });
            }
        }
        else {
            ranks.push({ RankID: 0, RankDescription: "" });
        }
        return resolve(ranks);
    });
}

export const getCustomerRankQualifications = function (request) {

}

