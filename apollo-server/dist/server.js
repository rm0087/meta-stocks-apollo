import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import BalanceSheetsApi from './balance-sheet-api.js';
const typeDefs = `
    type BalanceSheet {
        company_cik: Int
        total_assets: String
        total_liabilities: String
        total_stockholders_equity: String
    }

    type Query {
        balanceSheets: [BalanceSheet]
        companyBalanceSheets(cik: Int!): [BalanceSheet]
    }
`;
const resolvers = {
    Query: {
        balanceSheets: async (_, __, { dataSources }) => {
            return dataSources.balanceSheetAPI.getBalanceSheets();
        },
        companyBalanceSheets: async (_, { cik }, { dataSources }) => {
            return dataSources.balanceSheetAPI.companyBalanceSheets(cik);
        }
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
                balanceSheetAPI: new BalanceSheetsApi({ cache }),
            },
        };
    },
});
console.log(`Server running at ${url}`);
