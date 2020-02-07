/** File Name : constant.js
 * Description : To replace hardcoded values with constants
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 31st Jan 2020
 */
export const SoapHeader = `<soap:Header>
                                <ApiAuthentication xmlns="http://api.exigo.com/">
                                     <LoginName>chalkapi</LoginName>
                                     <Password>5PhHK339B76k2eM8</Password>
                                     <Company>chalkcouture</Company>
                                </ApiAuthentication>
                            </soap:Header>`

export const CommissionStartDate = '2018-07-01'

export const ResponseCode = {
     OK: 200
}

export const ResponseStatus = {
     Success: 'success',
     Failed: 'failed'
}

export const BonusTypes = {
     DeferredCommission: 1,
     SavvySeller: 4,
     SponsorBonus: 5,
     CoachingBonus: 6,
     CouturierBonus: 7
}

export const PeriodTypes = {
     Default: 1
}

export const CurrencyCode = {
     CA: "CAD",
     US: "USD"
}

export const CommissionTypes = {
     CurrentCommission: 0,
     HistoricalCommission: 1,
     HistoricalSummaryCommission: 2
}

export const CustomerTypes = {
     RetailCustomer: 1,
     PreferredCustomer: 2,
     Distributor: 3,
     D2C: 4
}

export const CustomerStatuses = {
     Deleted: 0,
     Active: 1,
     Inactive: 2,
     Suspended: 3,
     Terminated: 4,
     Resigned: 5,
     Paused: 6,
     Former: 7
}