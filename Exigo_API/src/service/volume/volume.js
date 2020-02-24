/** File Name : Volume.js
 * Description :  for volume
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 31st Jan 2020
 */
import sql from 'mssql';
import { getCurrentPeriod } from '../period/period';
import { executeQuery } from '../../db/mssql';
import * as constants from '../../common/constant';

export const volumeList = function (customerId, pageSize, pageNumber) {
    const Result =
    {
        Status: "",
        Errors: ""
    };
    return new Promise(async (resolve, reject) => {

        let query = `SELECT 
                          p.PeriodID
                         ,PeriodDescription = Right
                         (PeriodDescription, 
                         CHARINDEX(' ', Reverse(PeriodDescription), 
                         CHARINDEX(' ', Reverse(PeriodDescription))+1))
                        ,hs.PaidAsTitle AS PaidRankDescription
                        ,hs.PV
                        ,hs.TV
                        ,hs.L1M
                        ,hs.PSQ
                    FROM
                        HistoricalCommission.HistoricalSummary AS hs	
                        INNER JOIN Periods p
                                   ON p.PeriodID = hs.PeriodID
                        WHERE
                             hs.DesignerID = @customerID
                             AND p.PeriodTypeID = @periodtypeid
                             AND p.PeriodID < 19 
                    UNION
                        SELECT 
                            pv.PeriodID
                           ,PeriodDescription = Right
                            (PeriodDescription, 
                            CHARINDEX(' ', Reverse(PeriodDescription), 
                            CHARINDEX(' ', Reverse(PeriodDescription))+1))
                           ,r.RankDescription as PaidRankDescription
                           ,pv.Volume2 as PV
                           ,pv.Volume5 as TV
                           ,pv.Volume8 as L1M
                           ,pv.Volume7 as PSQ
                       FROM 
                           PeriodVolumes pv 
                              left JOIN Periods p
                              ON p.PeriodID = pv.PeriodID 
                           INNER JOIN Ranks r 
                              ON r.RankID = pv.PaidRankID
                           WHERE 
                              pv.CustomerID = @customerID
                              AND pv.PeriodTypeID = @periodtypeid
                              AND p.PeriodID >= 19 order by 1 desc`;


        let params = [
            { Name: 'CustomerID', Type: sql.BigInt, Value: customerId },
            { Name: 'periodtypeid', Type: sql.Int, Value: constants.PeriodTypes.Default }
        ];
        try {
            //await open();
            let volumelist = await executeQuery({ SqlQuery: query, SqlParams: params, PageSize: pageSize, PageNumber: pageNumber })
            Result.Status = constants.ResponseStatus.Success;
            Result.Errors = "";
            return resolve({ "Result": Result, "Items": volumelist });
        }
        catch (err) {
            Result.Status = "";
            Result.Errors = ResponseStatus.Failed;
            //throw err
            return resolve({ "Result": Result, "Items": err });
        }
        finally {
            // await close()
        }

    });
}

/**
 * Get Customer Volumes Like PV,TV,EV,PSQ,Level 1 Mentors,Master Mentor Legs
 * @param CustomerID
 * @param PeriodTypeID
 * @param PeriodID
 * @param VolumesToFetch
 * @returns Commission details
 */
export const getCustomerVolumes = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            const customerId = Number(request.CustomerID);

            const periodTypeId = Number(request.PeriodTypeID);

            let periodId = 0
            if (request.PeriodID === null || request.PeriodID === undefined) {
                const period = await getCurrentPeriod(periodTypeId);
                periodId = Number(period.PeriodID);
            }
            else {
                periodId = Number(request.PeriodID);
            }
            const totalVolumeBuckets = 200;
            let volumeSelectQuery = "";

            if (request.VolumesToFetch === undefined) {
                for (let i = 1; i <= totalVolumeBuckets; i++) {
                    volumeSelectQuery = volumeSelectQuery + `, Volume${i} = isnull(pv.Volume${i}, 0)`;
                }
            } else {
                request.VolumesToFetch.forEach(function (d) {
                    volumeSelectQuery = volumeSelectQuery + `, Volume${d} = isnull(pv.Volume${d}, 0)`;
                })
            }

            let query = `Select 
                             c.CustomerID			                        
                            , ModifiedDate = isnull(pv.ModifiedDate, '01/01/1900')
                              ${volumeSelectQuery}
                            , PeriodID = p.PeriodID
                            , PeriodTypeID = p.PeriodTypeID
                            , PeriodDescription = p.PeriodDescription
                            , StartDate = p.StartDate
                            , EndDate = p.EndDate
                            , ActualEndDate = dateadd(day, 1, p.EndDate)
                            , RankID = isnull(pv.RankID,0)
                            , RankDescription = isnull(r.RankDescription, '')
                            , RankID = isnull(pv.PaidRankID,0)
                            , RankDescription = isnull(pr.RankDescription, '') 
                            , RankID = ISNULL((SELECT  Max(pvr.PaidRankID) from PeriodVolumes pvr where pvr.CustomerID = pv.CustomerID  AND ((((pv.PeriodID - 1) / 3) * 3) + -2)  <= pvr.PeriodID AND  pv.PeriodID >= pvr.PeriodID),0)
                            , RankDescription = ISNULL((select RankDescription from Ranks where RankID = (SELECT  Max(pvr.PaidRankID) from PeriodVolumes pvr where pvr.CustomerID = pv.CustomerID  AND ((((pv.PeriodID - 1) / 3) * 3) + -2)  <= pvr.PeriodID AND  pv.PeriodID >= pvr.PeriodID)),'')
                        FROM Customers c
                             LEFT JOIN PeriodVolumes pv
                                  ON pv.CustomerID = c.CustomerID
                             LEFT JOIN Periods p
                                  ON pv.PeriodID = p.PeriodID
                                  AND pv.PeriodTypeID = p.PeriodTypeID
                             LEFT JOIN Ranks r
                                  ON r.RankID = c.RankID
                             LEFT JOIN Ranks pr
                                  ON pr.RankID = pv.PaidRankID
                             WHERE pv.CustomerID = @customerid
                                  AND p.PeriodTypeID = @periodtype
                                  AND p.PeriodID = @periodid`;

            let params = [
                { Name: 'customerid', Type: sql.BigInt, Value: customerId },
                { Name: 'periodtype', Type: sql.Int, Value: periodTypeId },
                { Name: 'periodid', Type: sql.Int, Value: periodId }
            ]

            let volumes = await executeQuery({ SqlQuery: query, SqlParams: params });

            return resolve(volumes[0]);
        }
        catch (err) {
            console.log(err.message);
            //throw err
        }
    });
}
