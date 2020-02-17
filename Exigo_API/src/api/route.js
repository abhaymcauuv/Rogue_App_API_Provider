/** File Name : route.js
 * Description : route information
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 12th Feb 2020
 */

import {
    customerRealTimeCommissions,
    historicalCommissionPeriod,
    currentPeriod,
    summaryCommissions,
    currentCommission,
    periods,
    historicalCommissions,
    realTimeBonusDetails,
    historicalBonusDetails,
    customerList,
    customerDetails,
    orderList,
    autoOrderList,
    clubCoutureCustomerList,
    activity,
    volumesList,
    rankAdvancement
} from './index';

export const routes = [
    { method: 'POST', path: '/customerrealtimecommissions', handler: customerRealTimeCommissions },
    { method: 'GET', path: '/historicalcommissionperiod', handler: historicalCommissionPeriod },
    { method: 'GET', path: '/currentperiod/{periodtypeid}', handler: currentPeriod },
    { method: 'GET', path: '/summarycommissions/{customerid}', handler: summaryCommissions },
    { method: 'GET', path: '/currentcommission/{customerid}/{periodtypeid}', handler: currentCommission },
    { method: 'POST', path: '/periods', handler: periods },
    { method: 'GET', path: '/historicalcommissions/{customerid}/{runid}', handler: historicalCommissions },
    { method: 'POST', path: '/realtimebonusdetails', handler: realTimeBonusDetails },
    { method: 'POST', path: '/historicalbonusdetails', handler: historicalBonusDetails },
    { method: 'POST', path: '/customerlist', handler: customerList },
    { method: 'POST', path: '/customerdetails', handler: customerDetails },
    { method: 'POST', path: '/orderlist', handler: orderList },
    { method: 'POST', path: '/autoorderlist', handler: autoOrderList },
    { method: 'POST', path: '/clubcouturecustomerlist', handler: clubCoutureCustomerList },
    { method: 'GET', path: '/activity/{id}', handler: activity },
    { method: 'POST', path: '/volumes', handler: volumesList },
    { method: 'GET', path: '/rankadvancement/{id}', handler: rankAdvancement },
]
export default routes;

