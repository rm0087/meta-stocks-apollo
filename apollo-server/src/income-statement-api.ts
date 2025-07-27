import { RESTDataSource } from "@apollo/datasource-rest";

class IncomeStatementsAPI extends RESTDataSource {
    override baseURL = 'http://localhost:5555/';

    async companyIncomeStatements(cik) {
        return this.get(`income_statements/${cik}`)
    }
}

export default IncomeStatementsAPI