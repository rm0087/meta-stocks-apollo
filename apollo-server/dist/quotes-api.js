import { RESTDataSource } from "@apollo/datasource-rest";
class QuotesAPI extends RESTDataSource {
    baseURL = 'http://localhost:5555/';
    async getQuotes(ticker) {
        const request = await this.get(`quotes/${ticker}`);
        return request.bars[`${ticker}`][0];
    }
}
export default QuotesAPI;
