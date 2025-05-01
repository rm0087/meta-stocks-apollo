import { RESTDataSource } from "@apollo/datasource-rest";

class KeywordsAPI extends RESTDataSource {
    override baseURL = 'http://localhost:5555/';

    async getKeywords() {
        return this.get(`keywords`)
    }

    async postCoKeyRelationship(ticker, keywordId) {
        console.log(ticker, keywordId)
        return this.post('association', {body: {ticker:ticker, keywordId:keywordId}})
    }
}

export default KeywordsAPI