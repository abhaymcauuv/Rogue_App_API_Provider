/** File Name : Period.js
 * Description :  for period 
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 31st Jan 2020
 */
import sql from 'mssql';
import {executeQuery } from '../../db/mssql'

/**
 * Get Current Period
 * @param periodTypeID
 * @returns Current Period
 */
export const getCurrentPeriod = function (periodTypeID) {
    const periodTypeId = Number(periodTypeID)
    return new Promise(async (resolve, reject) => {
            let query = `SELECT p.PeriodTypeID
                                        , p.PeriodID
                                        , p.PeriodDescription
                                        , p.StartDate
                                        , p.EndDate
                                        , dateadd(day, 1, p.EndDate) as ActualEndDate
                                        , p.AcceptedDate
                                        FROM Periods p
                                         WHERE p.PeriodTypeID = @periodtype
                                         AND GETDATE() between p.StartDate and dateadd(day, 1, p.EndDate)
                                         ORDER BY p.AcceptedDate desc, p.EndDate desc`;

            let params = [
                            { Name: 'periodtype', Type: sql.Int, Value: periodTypeId }
                         ];
            let currentPeriodResult = await executeQuery({ SqlQuery: query, SqlParams: params })
            if(currentPeriodResult.length === 0){
                return resolve('');
            }
            const period = currentPeriodResult[0];
            return resolve(period);
    });
}

/**
 * Get Periods
 * @param periodTypeID
 * @param PeriodIDs
 * @returns Current Period
 */
export const getPeriods = function (request) {
    return new Promise(async (resolve, reject) => {
            const periodIds = request.PeriodIDs
            const periodTypeId = Number(request.PeriodTypeID)

            let query = ` SELECT p.PeriodTypeID
                               , p.PeriodID
                               , p.PeriodDescription
                               , p.StartDate
                               , p.EndDate
                               , dateadd(day, 1, p.EndDate) as ActualEndDate
                               , p.AcceptedDate
                            FROM Periods p
                                WHERE p.PeriodTypeID = @PeriodTypeID
                                AND p.PeriodID IN (@PeriodID)
                                Order by p.PeriodID Desc`;

            let params = [
                            { Name: 'PeriodTypeID', Type: sql.Int, Value: periodTypeId },
                            { Name: 'PeriodID', Value: periodIds }
                        ];

            let periods = await executeQuery({ SqlQuery: query, SqlParams: params });
            return resolve(periods);
    });
}
