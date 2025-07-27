import { RESTDataSource } from "@apollo/datasource-rest";

class SuggestionsAPI extends RESTDataSource {
    override baseURL = 'http://localhost:5555/';

    async getSuggestions(query) {
        return this.get(`api/companies/search?query=${query}`)
    }
}

export default SuggestionsAPI