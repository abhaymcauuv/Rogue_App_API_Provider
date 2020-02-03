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
                        Bonuses: ["//Bonuses//CommissionBonusResponse", {
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
                    var commission = {
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
                        const bonus = {
                            Description: data.Description,
                            Amount:  data.Amount,
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