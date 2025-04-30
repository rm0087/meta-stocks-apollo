

const resolvers = {
    Query: {
        getCompany: async (_, {ticker}, {dataSources }) => {
            return dataSources.companiesAPI.getCompany(ticker)
        },
        companyBalanceSheets: async (_, {cik}, {dataSources}) => {
            return dataSources.balanceSheetAPI.companyBalanceSheets(cik);
        },
        companyIncomeStatements: async (_, {cik}, {dataSources}) => {
            return dataSources.incomeStatementAPI.companyIncomeStatements(cik);
        },
        getCompanyFilings: async (_, {cik_10}, {dataSources}) => {
            return dataSources.filingsAPI.getCompanyFilings(cik_10);
        },
        getSuggestions: async (_, { query }, { dataSources }) => {
            return dataSources.suggestionsAPI.getSuggestions(query);
        },
    }
}