/** File Name : Order.js
 * Description :  To get order details
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 12th Feb 2020
 */
import sql from 'mssql';
import { executeQuery } from '../../db/mssql';
import * as constants from '../../common/constant';

export const getCustomerOrders = function (request) {
    const customerID = Number(request.CustomerID)
    const orderID = Number(request.OrderID)
    let CustomerOrdersResponse = {
        Orders: [],
        OrderCount: 0,
        Page: 0,
        RowCount: 0
    }
    return new Promise(async (resolve, reject) => {
        try {
            if (orderID != null && orderID <= 0 && customerID <= 0) {
                return resolve("");
            }
            let where = ""
            if (orderID != null) {
                where = `OrderID =@orderid AND (CustomerID =@customerid OR Other14 = CAST( @customerid AS NVARCHAR(200)))`;
            }
            else {
                where = `(CustomerID = @customerid OR Other14 = CAST(@customerid AS NVARCHAR(200)))`;
            }

            if (request.OrderTypes.length != 0) {
                where += `AND OrderTypeID in @ordertypes`;
            }
            if (request.OrderStatuses.length != 0) {
                where += `AND OrderStatusID in @orderstatuses`;
            }

            let getCount = request.TotalRowCount == 0;

            if (getCount) {
                const count = await sql.query` SELECT Count(OrderID) FROM [Orders] Where ${where}`
                var resData = count.recordset
                CustomerOrdersResponse.OrderCount = Number(resData);
            }
            else {
                CustomerOrdersResponse.OrderCount = request.TotalRowCount;
            }
            let orderQuery = `SELECT 
                                  [OrderID]
                                 ,[CustomerID] 
                                 ,[OrderStatusID]
                                 ,[OrderTypeID]
                                 ,[OrderDate]
                                 ,[CurrencyCode]
                                 ,[WarehouseID]
                                 ,[ShipMethodID]
                                 ,[PriceTypeID]
                                 ,[Notes]
                                 ,[Total]
                                 ,[SubTotal]
                                 ,[TaxTotal]
                                 ,[ShippingTotal]
                                 ,[DiscountTotal]
                                 ,[DiscountPercent]
                                 ,[WeightTotal]
                                 ,[PVTotal] = [BusinessVolumeTotal]
                                 ,[CVTotal] = [CommissionableVolumeTotal]
                                 ,[TrackingNumber1]
                                 ,[TrackingNumber2]
                                 ,[TrackingNumber3]
                                 ,[TrackingNumber4]
                                 ,[TrackingNumber5]
                                 ,[Other1Total]
                                 ,[Other2Total]
                                 ,[Other3Total]
                                 ,[Other4Total]
                                 ,[Other5Total]
                                 ,[Other6Total]
                                 ,[Other7Total]
                                 ,[Other8Total]
                                 ,[Other9Total]
                                 ,[Other10Total]
                                 ,[ShippingTax]
                                 ,[OrderTax]
                                 ,[FedTaxTotal]
                                 ,[StateTaxTotal]
                                 ,[FedShippingTax]
                                 ,[StateShippingTax]
                                 ,[CityShippingTax]
                                 ,[CityLocalShippingTax]
                                 ,[CountyShippingTax]
                                 ,[CountyLocalShippingTax]
                                 ,[Other11]
                                 ,[Other12]
                                 ,[Other13]
                                 ,[Other14]
                                 ,[Other15]
                                 ,[Other16]
                                 ,[Other17]
                                 ,[Other18]
                                 ,[Other19]
                                 ,[Other20]
                                 ,[IsCommissionable]
                                 ,[AutoOrderID]
                                 ,[ReturnOrderID]
                                 ,[ReplacementOrderID]
                                 ,[ParentOrderID]
                                 ,[BatchID]
                                 ,[DeclineCount]
                                 ,[TransferToCustomerID]
                                 ,[PartyID]
                                 ,[WebCarrierID1]
                                 ,[WebCarrierID2]
                                 ,[WebCarrierID3]
                                 ,[WebCarrierID4]
                                 ,[WebCarrierID5]
                                 ,[ShippedDate]
                                 ,[CreatedDate]
                                 ,[LockedDate]
                                 ,[ModifiedDate]
                                 ,[CreatedBy]
                                 ,[ModifiedBy]
                                 ,[SuppressPackSlipPrice]
                                 ,[ReturnCategoryID]
                                 ,[ReplacementCategoryID]
                                 ,[FirstName]
                                 ,[LastName]
                                 ,[Company]
                                 ,[Address1]
                                 ,[Address2]
                                 ,[City]
                                 ,[State]
                                 ,[Zip]
                                 ,[Country]
                                 ,[County]
                                 ,[Email]
                                 ,[Phone]
                             FROM [Orders]
                                  Where ${where}
                                  ORDER BY OrderDate DESC
                                  OFFSET @Skip ROWS       
                                  FETCH NEXT @Take ROWS ONLY`;

            let orderParams = [{ Name: 'orderid', Type: sql.BigInt, Value: orderID },
            { Name: 'customerid', Type: sql.BigInt, Value: customerID },
            { Name: 'orderstatuses', Value: request.OrderStatuses },
            { Name: 'ordertypes', Value: request.OrderTypes },
            { Name: 'Skip', Type: sql.Int, Value: request.Skip },
            { Name: 'Take', Type: sql.Int, Value: request.Take }]

            let orders = await executeQuery({ SqlQuery: orderQuery, SqlParams: orderParams })

            if (request.IncludeOrderDetails) {
                let orderIDs = orders.map(o => o.OrderID)

                let orderDetailsQuery = `SELECT 
                                              [OrderID]
                                             ,[OrderLine]
                                             ,[ItemID]
                                             ,[ItemCode]
                                             ,[ItemDescription]
                                             ,[Quantity]
                                             ,[PriceEach]
                                             ,[PriceTotal]
                                             ,[Tax]
                                             ,[WeightEach]
                                             ,[Weight]
                                             ,[BusinessVolumeEach]
                                             ,[BusinessVolume]
                                             ,[CommissionableVolumeEach]
                                             ,[CommissionableVolume]
                                             ,[ParentItemID]
                                             ,[Taxable]
                                             ,[FedTax]
                                             ,[StateTax]
                                             ,[CityTax]
                                             ,[CityLocalTax]
                                             ,[CountyTax]
                                             ,[CountyLocalTax]
                                             ,[ManualTax]
                                             ,[IsStateTaxOverride]
                                             ,[Reference1]
                                        FROM [OrderDetails]
                                             WHERE OrderID in (@orderids)`;

                let orderDetailsParams = [{ Name: 'orderids', Value: orderIDs }]

                let orderDetails = await executeQuery({ SqlQuery: orderDetailsQuery, SqlParams: orderDetailsParams })

                let ItemCodes = orderDetails.map(i => i.ItemCode)
                let imagesQuery = `SELECT DISTINCT 
                                                [ItemCode]
                                               ,[SmallImageUrl] = [SmallImageName]
                                               ,[IsVirtual]
                                            FROM [Items] 
                                                WHERE ItemCode IN (@itemcode)`;


                let imageParams = [{ Name: 'itemcode', Value: ItemCodes }]
                let imageUrls = await executeQuery({ SqlQuery: imagesQuery, SqlParams: imageParams })


                for (var i = 0; i < orders.length; i++) {
                    var order = orders[i]
                    let details = orderDetails.filter(o => o.OrderID === Number(order.OrderID));
                    for (var x = 0; x < details.length; x++) {
                        var detail = details[x]
                        let imageUrl = imageUrls.find(function (item) {
                            return (item.ItemCode === detail.ItemCode)
                        });
                        if (imageUrl != null) {
                            let ImageUrl = {
                                ImageUrl: imageUrl.SmallImageUrl
                            }
                            details[x] = { ...detail, ...ImageUrl }
                        }
                    }
                    let OrderDetails = {
                        OrderDetails: details
                    }
                    orders[i] = { ...order, ...OrderDetails }
                }
            }

            if (request.IncludePayments) {
                let orderIDs = orders.map(o => o.OrderID)
                let orderPaymentquery = `SELECT
                                            [PaymentID]  
                                           ,[CustomerID]
                                           ,[OrderID]
                                           ,[PaymentTypeID]
                                           ,[PaymentDate]
                                           ,[Amount]
                                           ,[CurrencyCode]
                                           ,[WarehouseID]
                                           ,[BillingName]
                                           ,[CreditCardTypeID]
                                           ,[CreditCardNumber]
                                           ,[AuthorizationCode]
                                           ,[Memo]
                                           ,[BillingAddress1]
                                           ,[BillingAddress2]
                                           ,[BillingCity]
                                           ,[BillingState]
                                           ,[BillingZipAddress]
                                           ,[BillingCountry]
                                     FROM [Payments] 
                                            WHERE OrderID in (@orderid)`;

                let paymentParams = [{ Name: 'orderid', Value: orderIDs }]
                let orderPayments = await executeQuery({ SqlQuery: orderPaymentquery, SqlParams: paymentParams })

                for (var i = 0; i < orders.length; i++) {
                    var order = orders[i]
                    let payment = orderPayments.find(function (p) {
                        return (p.OrderID === Number(order.OrderID))
                    });
                    let Payments = {
                        Payments: payment
                    }
                    orders[i] = { ...order, ...Payments }
                }
            }
            CustomerOrdersResponse.Orders = orders
            return resolve(CustomerOrdersResponse);
        }
        catch (err) {
            throw err
        }
    });
}

