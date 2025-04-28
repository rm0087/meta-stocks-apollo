import { RESTDataSource } from "@apollo/datasource-rest";

class BalanceSheetsAPI extends RESTDataSource {
    override baseURL = 'http://localhost:5555/';

    async getBalanceSheets() {
        return this.get(`balance_sheets`);
    };

    async companyBalanceSheets(cik) {
        return this.get(`balance_sheets/${cik}`)
    }
}

export default BalanceSheetsAPI