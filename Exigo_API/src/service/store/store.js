/** File Name : Report.js
 * Description :  To get reports
 * Created By : Abhay
 * Modified By : Abhay
 * Last modified : 12th Feb 2020
 */
import { getWebCategory } from '../product/item';

/**
 * Get Item Category
 * @returns Item Category
 */
export const getItemCategory = function (request) {
    return new Promise(async (resolve, reject) => {
        try {
            let webId = 1;
            let categoryID = 7;
            let categories = await getWebCategory(categoryID, webId);
            let Category = [];
            let data = categories.filter(c => c.ParentID == categoryID);

            data.forEach(element => {
                let subCategory = categories.filter(c => c.ParentID == element.WebCategoryID);
                let s = {
                    SubCategory: subCategory
                };
                let d = {
                    ...element,
                    ...s
                };
                Category.push(d);
            });

            return resolve(Category);
        }
        catch (err) {
            console.log(err.message);
        }
    });
}
