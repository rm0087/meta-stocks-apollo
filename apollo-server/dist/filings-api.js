import { RESTDataSource } from "@apollo/datasource-rest";
class FilingsAPI extends RESTDataSource {
    baseURL = 'http://localhost:5555/';
    async getCompanyFilings(cik_10) {
        return this.get(`filings/${cik_10}`);
    }
}
export default FilingsAPI;
