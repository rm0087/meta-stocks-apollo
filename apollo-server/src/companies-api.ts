import { RESTDataSource } from "@apollo/datasource-rest";

class CompaniesAPI extends RESTDataSource {
    override baseURL = 'http://localhost:5555/';

    async getCompany(ticker) {
        return this.get(`companies/${ticker}`)
    }
}

export default CompaniesAPI