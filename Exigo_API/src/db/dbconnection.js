/** File Name : dbconnection.js
 * Description : create db instance
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 31st Jan 2020
 */
import sql from 'mssql';
import { dbconnection } from '../common/config';

export const poolPromise = new sql.ConnectionPool(dbconnection.config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool
    })
    .catch(err => console.log('Database Connection Failed! Bad Config:', err))


export const close = async function () {
    sql.close();
}