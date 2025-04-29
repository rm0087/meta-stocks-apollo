import React from "react";
import ReactDOM from "react-dom/client"; // Make sure to use 'react-dom/client' for React 18
import App from "./components/App";
import "./output.css";
import { ApolloClient, InMemoryCache, ApolloProvider} from '@apollo/client';

const client = new ApolloClient({
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
);