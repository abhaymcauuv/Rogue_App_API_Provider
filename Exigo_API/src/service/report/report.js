/** File Name : Report.js
 * Description :  To get reports
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 12th Feb 2020
 */
import { getCustomers, getCustomer, isCustomerActive, isCustomerInEnrollerDownline } from '../customer/customer';
import { getCustomerVolumes } from '../volume/volume';
import * as constants from '../../common/constant';
import { getCurrentPeriod } from '../period/period';
import { getOrders, getAutoOrders } from '../order/order';

export const getCustomerList = function (request) {
    return getCustomers(request);
}

/**
 * Get Customer Details
 * @param CustomerID
 * @param ID
 * @returns Customer Details
 */
export const getCustomerDetails = function (id, customerId) {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {
                Customer: {},
            };
            const period = await getCurrentPeriod(constants.PeriodTypes.Default);
            const periodId = Number(period.PeriodID);

            response.Customer = await getCustomer(id, periodId);
            let isDistributor = Number(response.Customer.CustomerTypeID) == constants.CustomerTypes.Distributor || Number(response.Customer.CustomerTypeID) == constants.CustomerTypes.D2C;

            if (isDistributor) {
                response.Volumes = await getCustomerVolumes({
                    CustomerID: id,
                    PeriodTypeID: constants.PeriodTypes.Default,
                    PeriodID: periodId,
                    VolumesToFetch: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                });
                response.IsActive = await isCustomerActive(id, periodId);

                if (Number(response.Customer.EnrollerID) > 0) {
                    response.Enroller = await getCustomer(Number(response.Customer.EnrollerID), periodId);
                    if (Number(response.Customer.EnrollerID) == Number(response.Customer.SponsorID)) {
                        response.Sponsor = response.Enroller;
                    }
                    else {
                        if (Number(response.Customer.SponsorID) > 0) {
                            response.Sponsor = await getCustomer(Number(response.Customer.SponsorID), periodId);
                        }
                    }
                }

                if (Number(response.Customer.RankID) == 0) {
                    response.Customer.RankID = response.Volumes ? response.Volumes.RankID[0] : 0;
                }

                if (Number(response.Customer.EnrollerID) != customerId && Number(response.Customer.CustomerID) != customerId) {
                    response.IsInEnrollerTree = await isCustomerInEnrollerDownline(customerId, Number(response.Customer.CustomerID));
                }
            }
            return resolve(response);
        }
        catch (err) {
            throw err;//TODO:Error log to be added
        }
    });
}

export const getOrderList = function (request) {
    return getOrders(request);
}

export const getAutoOrderList = function (request) {
    return getAutoOrders(request);
}
