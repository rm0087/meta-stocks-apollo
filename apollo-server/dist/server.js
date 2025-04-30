import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import BalanceSheetsAPI from './balance-sheet-api.js';
import IncomeStatementsAPI from './income-statement-api.js';
import CompaniesAPI from './companies-api.js';
import FilingsAPI from './filings-api.js';
import SuggestionsAPI from './suggestions-api.js';
import QuotesAPI from './quotes-api.js';
const typeDefs = `
    type BalanceSheet {
        company_cik: Int
        total_assets: String
        total_liabilities: String
        total_stockholders_equity: String
        end: String
        cash_and_equiv: String
        currency: String
    }

    type IncomeStatement {
        company_cik: Int
        net_income: String
        total_revenue: String
        operating_income: String
        end: String
        currency: String
    }

    type Company {
        name: String
        ticker: String
        cik: Int
        cik_10: String
    }

    type Filing {
        form: String
        accn: String
        filingDate: String
        reportDate: String
        fullFilingUrl: String
        doc: String
        urlPrefix: String
        txt: String
    }

    type Filings {
        fin: [Filing]
        insiders: [Filing]
        institutions: [Filing]
        latest: [Filing]
    }
    
    type Quote {
        c: String
        h: String
        l: String
        n: String
        o: String
        t: String
        v: String
        vw: String
    }

    type Query {
        balanceSheets: [BalanceSheet]
        companyBalanceSheets(cik: Int!): [BalanceSheet]
        companyIncomeStatements(cik: Int!): [IncomeStatement]
        getCompany(ticker: String!): Company
        getCompanyFilings(cik_10: String!): Filings
        getSuggestions(query: String!): [Company]
        getQuotes(ticker: String!): Quote
    }
`;
const resolvers = {
    Query: {
        getCompany: async (_, { ticker }, { dataSources }) => {
            return dataSources.companiesAPI.getCompany(ticker);
        },
        companyBalanceSheets: async (_, { cik }, { dataSources }) => {
            return dataSources.balanceSheetAPI.companyBalanceSheets(cik);
        },
        companyIncomeStatements: async (_, { cik }, { dataSources }) => {
            return dataSources.incomeStatementAPI.companyIncomeStatements(cik);
        },
        getCompanyFilings: async (_, { cik_10 }, { dataSources }) => {
            return dataSources.filingsAPI.getCompanyFilings(cik_10);
        },
        getSuggestions: async (_, { query }, { dataSources }) => {
            return dataSources.suggestionsAPI.getSuggestions(query);
        },
        getQuotes: async (_, { ticker }, { dataSources }) => {
            return dataSources.quotesAPI.getQuotes(ticker);
        },
    }
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
const { url } = await startStandaloneServer(server, {
    context: async () => {
        const { cache } = server;
        return {
            dataSources: {
                balanceSheetAPI: new BalanceSheetsAPI({ cache }),
                incomeStatementAPI: new IncomeStatementsAPI({ cache }),
                companiesAPI: new CompaniesAPI({ cache }),
                filingsAPI: new FilingsAPI({ cache }),
                suggestionsAPI: new SuggestionsAPI({ cache }),
                quotesAPI: new QuotesAPI({ cache }),
            },
        };
    },
});
console.log(`Server running at ${url}`);
