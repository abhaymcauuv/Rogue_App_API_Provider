/** File Name : Rank.js
 * Description :  for Ranks 
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 15th Feb 2020
 */
import sql from 'mssql';
import { executeQuery } from '../../db/mssql';
import * as constants from '../../common/constant';
import { getRankQualifications } from '../webservice/webservice'

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


/**
 * Get Customer Rank Qualifications
 * @param CustomerID
 * @param RankID
 * @returns Customer Rank Qualifications
 */
export const getCustomerRankQualifications = function (request) {
    return new Promise(async (resolve, reject) => {
        let apiResponse = await getRankQualifications({ CustomerID: request.CustomerID, RankID: request.RankID, PeriodType: constants.PeriodTypes.Default });

        let response = {
            TotalPercentComplete: apiResponse.Score,
            IsQualified: (apiResponse.Qualifies || apiResponse.QualifiesOverride),
            Rank: {
                RankID: apiResponse.RankID,
                RankDescription: apiResponse.RankDescription
            }
        };

        if (apiResponse.BackRankID) {
            let previousRank = {
                PreviousRank: {
                    RankID: apiResponse.BackRankID,
                    RankDescription: apiResponse.BackRankDescription
                }
            }
            response = { ...response, ...previousRank };
        }

        if (apiResponse.NextRankID) {
            let nextRank = {
                NextRank: {
                    RankID: apiResponse.NextRankID,
                    RankDescription: apiResponse.NextRankDescription
                }
            }
            response = { ...response, ...nextRank };
        }

        // let qualificationLegs = {
        //     QualificationLegs: []
        // }

        var rankQualificationLeg = [];
        apiResponse.PayeeQualificationLegs.forEach((qualification, index) => {
            let results = [];
            RankQualificationDefinitions.forEach((definition, i) => {
                let requirement = getRequirement(qualification, definition);
                if (requirement) {
                    results.push(requirement);
                }
            });
            if (results.length > 0) {
                let Requirements = {
                    Requirements: results
                };
                rankQualificationLeg.push(Requirements);
            }
        });

        let qualificationLegs = {
            QualificationLegs: rankQualificationLeg
        };
        response = { ...response, ...qualificationLegs };

        return resolve(response);
    });
}


export const getRequirement = function (qualificationLeg, definition) {
    let matchedQualification = [];
    var re = new RegExp(definition.Expression);

    qualificationLeg.forEach((q, i) => {
        let description = q.QualificationDescription.toUpperCase();
        if (re.test(description)) {
            matchedQualification.push(q);
        }
    });

    if (matchedQualification.length > 0) {
        let isBoolean = definition.Type == 1 ? true : false;
        let requiredValueAsDecimal = definition.Type != 1 ? parseFloat(matchedQualification[0].Required) : 100.00;
        let isQualified = (matchedQualification[0].Qualifies || matchedQualification[0].QualifiesOverride);
        let actualValueAsDecimal = 9999;

        if (!isBoolean) {
            actualValueAsDecimal = parseFloat(matchedQualification[0].Actual);
        }
        else if (isBoolean && isQualified) {
            actualValueAsDecimal = 100.00;
        }
        else if (isBoolean && !isQualified) {
            actualValueAsDecimal = 0;
        }

        let requiredToActualAsRatio = requiredValueAsDecimal > 0 ? (actualValueAsDecimal / requiredValueAsDecimal) : requiredValueAsDecimal;

        let requiredToActualAsPercent = requiredToActualAsRatio > 1 ? 100.00 : requiredToActualAsRatio * 100;
        let requirement = {
            IsQualified: isQualified,
            RequirementDescription: !isBoolean ? definition.RequirementDescription.replace('{{RequiredValueAsDecimal}}', requiredValueAsDecimal) : definition.RequirementDescription,
            IsBoolean: isBoolean,
            RequiredToActualAsPercent: requiredToActualAsPercent,
            ActualValueAsDecimal: actualValueAsDecimal,
            RequiredValueAsDecimal: requiredValueAsDecimal
        }
        return requirement;
    }
    return null;

}

const RankQualificationDefinitions = [
    {
        Label: "Customer Type",
        Expression: "MUST BE A VALID CUSTOMER TYPE",
        RequirementDescription: "You must be a Designer.",
        Type: 1
    },
    {
        Label: "Customer Status",
        Expression: "MUST HAVE A VALID STATUS - ACTIVE",
        RequirementDescription: "Your account must be in good standing.",
        Type: 1
    },
    {
        Label: "PV",
        Expression: "PERSONAL VOLUME",
        RequirementDescription: "You need at least {{RequiredValueAsDecimal}} Personal Volume (PV).",
        Type: 2
    },
    {
        Label: "TV",
        Expression: "TEAM VOLUME",
        RequirementDescription: "You need at least {{RequiredValueAsDecimal}} Team Volume (TV).",
        Type: 2
    },
    {
        Label: "EV",
        Expression: "ENTERPRISE VOLUME",
        RequirementDescription: "You need at least {{RequiredValueAsDecimal}} Enterprise Volume (EV).",
        Type: 2
    },
    {
        Label: "PSQ",
        Expression: "PERSONALLY SPONSORED QUALIFIEDS",
        RequirementDescription: "You need at least {{RequiredValueAsDecimal}} Personally Sponsored Qualifieds (PSQ).",
        Type: 2
    },
    {
        Label: "Level 1 Mentors",
        Expression: "^\d+ LEVEL 1 MENTORS$",
        RequirementDescription: "You need at least {{RequiredValueAsDecimal}} Level 1 Mentors.",
        Type: 2
    },
    {
        Label: "Unilevel Master Mentor Legs",
        Expression: "^\d+ UNILEVEL MASTER MENTOR LEGS$",
        RequirementDescription: "You need at least {{RequiredValueAsDecimal}} Unilevel Master Mentor Legs.",
        Type: 2
    },
    {
        Label: "Unilevel Couturier Legs",
        Expression: "^\d+ UNILEVEL COUTURIER LEGS$",
        RequirementDescription: "You need at least {{RequiredValueAsDecimal:N0}} Unilevel Couturier Legs.",
        Type: 2
    },
    {
        Label: "Unilevel Executive Couturier Legs",
        Expression: "^\d+ UNILEVEL EXECUTIVE COUTURIER LEGS$",
        RequirementDescription: "You need at least {{RequiredValueAsDecimal:N0}} Unilevel Executive Couturier Legs.",
        Type: 2
    },

];

