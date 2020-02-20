import soapRequest from 'easy-soap-request';
import { transform, prettyPrint } from 'camaro';
import * as constants from '../../common/constant';

export const getRealTimeCommissions = function (customerid) {
    const customerID = Number(customerid)
    return new Promise(async (resolve, reject) => {
        try {
            let RealTimeResponse = {
                Commissions: []
            };

            const headers = {
                'Content-Type': 'text/xml;charset=UTF-8',
                'soapAction': 'http://api.exigo.com/GetRealTimeCommissions',
            };

            const xml = `<soap:Envelope 
                                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                                   xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                            ${constants.SoapHeader}
                            <soap:Body>
                                <GetRealTimeCommissionsRequest xmlns="http://api.exigo.com/">
                                    <CustomerID>${customerID}</CustomerID>
                                </GetRealTimeCommissionsRequest>
                            </soap:Body>
                        </soap:Envelope>`;

            const template = {
                CommissionsResult: ["//GetRealTimeCommissionsResult", {
                    Result: ["//Result", {
                        Status: "Status",
                        Errors: "Errors",
                        TransactionKey: "TransactionKey"
                    }],
                    Commissions: ["//Commissions//CommissionResponse", {
                        CustomerID: "CustomerID",
                        PeriodType: "PeriodType",
                        PeriodID: "PeriodID",
                        PeriodDescription: "PeriodDescription",
                        CurrencyCode: "CurrencyCode",
                        CommissionTotal: "CommissionTotal",
                        Bonuses: ["Bonuses/CommissionBonusResponse", {
                            Description: "Description",
                            Amount: "Amount",
                            BonusID: "BonusID"
                        }]
                    }]
                }]
            };

            const errortemplate = {
                CustomerResult: ["//faultcode ", {
                    faultstring: "//faultstring"
                }]
            };

            const url = 'http://sandboxapi3.exigo.com/3.0/ExigoApi.asmx?WSDL?op=GetRealTimeCommissions';

            const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 100000 });
            const { body, statusCode } = response;
            const result = await transform(response.body, template);
            let resData = "";
            if (result.CommissionsResult.length > 0) {
                const commissionResult = result.CommissionsResult[0].Commissions;
                commissionResult.forEach(function (commissiondata, index) {
                    let commission = {
                        CustomerID: commissiondata.CustomerID,
                        PeriodType: commissiondata.PeriodType,
                        PeriodID: commissiondata.PeriodID,
                        PeriodDescription: commissiondata.PeriodDescription,
                        CurrencyCode: commissiondata.CurrencyCode,
                        CommissionTotal: commissiondata.CommissionTotal,
                        Bonuses: []
                    }
                    var bonuses = commissiondata.Bonuses;
                    bonuses.forEach(function (data, index) {
                        let bonus = {
                            Description: data.Description,
                            Amount: data.Amount,
                            BonusID: data.BonusID,
                        }
                        commission.Bonuses.push(bonus);
                    })
                    RealTimeResponse.Commissions.push(commission)
                })
            }
            else {
                const errresult = await transform(response.body, errortemplate);
                resData = errresult.CustomerResult[0].faultstring
            }
            return resolve(RealTimeResponse);
        }
        catch (err) {
            throw err
        }
    });
}

export const getRealTimeCommissionDetails = function (cId, pTypeId, pId, bId) {
    const promise = new Promise(async (resolve, reject) => {
        const commissionDetails = [];
        const headers = {
            'Content-Type': 'text/xml;charset=UTF-8',
            'soapAction': 'http://api.exigo.com/GetRealTimeCommissionDetail',
        };

        const xml = `<soap:Envelope 
                             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                             xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                             ${constants.SoapHeader}
                        <soap:Body>
                              <GetRealTimeCommissionDetailRequest xmlns="http://api.exigo.com/">
                                     <CustomerID>${cId}</CustomerID>
                                     <PeriodType>${pTypeId}</PeriodType>
                                     <PeriodID>${pId}</PeriodID>
                                     <BonusID>${bId}</BonusID>
                              </GetRealTimeCommissionDetailRequest>
                        </soap:Body>
                    </soap:Envelope>`;

        const template = {
            CommissionDetailsResult: ["//GetRealTimeCommissionDetailResult", {
                Result: ["//Result", {
                    Status: "Status",
                    Errors: "Errors",
                    TransactionKey: "TransactionKey"
                }],
                CommissionDetails: ["//CommissionDetails//CommissionDetailResponse", {
                    FromCustomerID: "FromCustomerID",
                    FromCustomerName: "FromCustomerName",
                    OrderID: "OrderID",
                    Level: "Level",
                    PaidLevel: "PaidLevel",
                    SourceAmount: "SourceAmount",
                    Percentage: "Percentage",
                    CommissionAmount: "CommissionAmount"
                }]
            }]
        };

        const errortemplate = {
            CustomerResult: ["//faultcode ", {
                faultstring: "//faultstring"

            }]
        };

        const url = 'http://sandboxapi3.exigo.com/3.0/ExigoApi.asmx?WSDL?op=GetRealTimeCommissionDetail';

        const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 100000 });
        const { body, statusCode } = response;
        const result = await transform(response.body, template);
        var resData = "";

        if (result.CommissionDetailsResult.length > 0) {
            const commissionDetailsResult = result.CommissionDetailsResult[0].CommissionDetails;
            commissionDetailsResult.forEach(function (detail, index) {
                var commissionDetail = {
                    BonusID: bId,
                    FromCustomerID: detail.FromCustomerID,
                    FromCustomerName: detail.FromCustomerName,
                    OrderID: detail.OrderID,
                    Level: detail.Level,
                    PaidLevel: detail.PaidLevel,
                    SourceAmount: detail.SourceAmount,
                    Percentage: detail.Percentage,
                    CommissionAmount: detail.CommissionAmount
                }
                commissionDetails.push(commissionDetail)
            })
        }
        else {
            const errresult = await transform(response.body, errortemplate);
            resData = errresult.CustomerResult[0].faultstring
        }
        return resolve(commissionDetails);
    });
    return promise;
}


export const getRankQualifications = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let RankQualifications = {};

            const headers = {
                'Content-Type': 'text/xml;charset=UTF-8',
                'soapAction': 'http://api.exigo.com/GetRankQualifications',
            };

            const xml = `<soap:Envelope 
                                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                                   xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                                   xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                            ${constants.SoapHeader}
                            <soap:Body>
                                <GetRankQualificationsRequest xmlns="http://api.exigo.com/">
                                    <CustomerID>${request.CustomerID}</CustomerID>
                                    <RankID>${request.RankID}</RankID>
                                    <PeriodType>${request.PeriodType}</PeriodType>
                                </GetRankQualificationsRequest>
                            </soap:Body>
                        </soap:Envelope>`;

            const template = {
                RankQualificationsResult: ["//GetRankQualificationsResult", {
                    Result: ["//Result", {
                        Status: "Status",
                        Errors: "Errors",
                        TransactionKey: "TransactionKey"
                    }],
                    CustomerID: "CustomerID",
                    RankID: "RankID",
                    RankDescription: "RankDescription",
                    Qualifies: "Qualifies",
                    QualifiesOverride: "QualifiesOverride",
                    PayeeQualificationLegs: ["PayeeQualificationLegs/ArrayOfQualificationResponse", {
                        QualificationResponse: ["QualificationResponse", {
                            QualificationDescription: "QualificationDescription",
                            Required: "Required",
                            Actual: "Actual",
                            Qualifies: "Qualifies",
                            QualifiesOverride: "QualifiesOverride",
                            Completed: "Completed",
                            Weight: "Weight",
                            Score: "Score"
                        }]
                    }],
                    BackRankID: "BackRankID",
                    BackRankDescription: "BackRankDescription",
                    NextRankID: "NextRankID",
                    NextRankDescription: "NextRankDescription",
                    Score: "Score"
                }]
            };

            const errortemplate = {
                CustomerResult: ["//faultcode ", {
                    faultstring: "//faultstring"
                }]
            };

            const url = 'http://sandboxapi3.exigo.com/3.0/ExigoApi.asmx?WSDL?op=GetRankQualifications';

            const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 100000 });
            const { body, statusCode } = response;
            const result = await transform(response.body, template);
            let resData = "";
            if (result.RankQualificationsResult.length > 0) {
                const qualificationsResult = result.RankQualificationsResult[0];
                let rankQualifications = {
                    CustomerID: qualificationsResult.CustomerID,
                    RankID: qualificationsResult.RankID,
                    RankDescription: qualificationsResult.RankDescription,
                    Qualifies: (qualificationsResult.Qualifies) ? (qualificationsResult.Qualifies == "true" ? true : false) : false,
                    QualifiesOverride: (qualificationsResult.QualifiesOverride) ? (qualificationsResult.QualifiesOverride == "true" ? true : false) : false,
                    BackRankID: qualificationsResult.BackRankID,
                    BackRankDescription: qualificationsResult.BackRankDescription,
                    NextRankID: qualificationsResult.NextRankID,
                    NextRankDescription: qualificationsResult.NextRankDescription,
                    Score: qualificationsResult.Score,
                    PayeeQualificationLegs: []
                }

                let payeeQualificationLegs = []
                qualificationsResult.PayeeQualificationLegs.forEach((data, index) => {
                    let ArrayOfQualification = [];
                    data.QualificationResponse.forEach((d, i) => {
                        let Qualification = {
                            QualificationDescription: d.QualificationDescription,
                            Required: d.Required,
                            Actual: d.Actual,
                            Qualifies: (d.Qualifies) ? (d.Qualifies == "true" ? true : false) : false,
                            QualifiesOverride: (d.QualifiesOverride) ? (d.QualifiesOverride == "true" ? true : false) : false,
                            Completed: d.Completed,
                            Weight: d.Weight,
                            Score: d.Score
                        };
                        ArrayOfQualification.push(Qualification);
                    });
                    payeeQualificationLegs.push(ArrayOfQualification);
                })
                rankQualifications.PayeeQualificationLegs = payeeQualificationLegs;
                RankQualifications = rankQualifications;
            }
            else {
                const errresult = await transform(response.body, errortemplate);
                resData = errresult.CustomerResult[0].faultstring
            }
            return resolve(RankQualifications);
        }
        catch (err) {
            throw err
        }
    });
}
