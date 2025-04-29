import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch, Link, Outlet} from 'react-router-dom';
import Routes from "./Routes";
import CompanyInfo from "./CompanyInfo";
import Financials from "./Financials";
import Keywords from "./Keywords";
import { useQuery, useLazyQuery, gql } from "@apollo/client";

const GET_COMPANY = gql`
    query GetCompany($ticker: String!) {
        getCompany(ticker: $ticker) {
            cik
            ticker
            name
            cik_10
        }
    }
`

export default function App() {
    const [queryTicker, setQueryTicker] = useState("");
    
    const [getCompany, { loading: coLoading, error: coError, data: coData }] = useLazyQuery(GET_COMPANY);

    useEffect(()=>{
        if (coData) {
            setCompany(coData.getCompany)
            setQuery("")
            setSuggestions("") 
        }
    },[coData])

    const[company, setCompany] = useState('');
    const [query, setQuery] = useState('');  // The current value of the search input
    const [suggestions, setSuggestions] = useState([]);  // The list of company suggestions
    const [loading, setLoading] = useState(false);  // Loading state for making requests
    const [price, setPrice] = useState(0);
    const [shares, setShares] = useState(0);
    const [filings, setFilings] = useState({});
    const serverUrl = "https://meta-stocks-demo.onrender.com";
   
    // Function to handle input changes
    const handleInputChange = (event) => {
        const searchQuery = event.target.value;
        setQuery(searchQuery);

        // If the query is empty, clear suggestions
        if (searchQuery.trim().length === 0) {
        setSuggestions([]);
        return;
        }

        // Fetch matching companies if the query is non-empty
        fetchSuggestions(searchQuery);
    };

    // Function to fetch suggestions from the backend
    const fetchSuggestions = async (searchQuery) => {
        setLoading(true);
        try {
            const response = await fetch(`api/companies/search?query=${searchQuery}`);
        
        // Check if the response is ok (status code 200)
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);  // Update the suggestions with the response data
            } else {
                setSuggestions([]);  // If response is not OK, clear suggestions
            }
        } catch (error) {
            console.error("Error fetching companies", error);
            setSuggestions([]);  // Clear suggestions in case of error
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(()=>{
        if (company) {
            const fetchPrice = async () => {
                try {
                    const response = await fetch(`quotes/${company.ticker}`)

                    if (!response.ok) {
                        setPrice(0)
                        throw new Error('Failed to retrieve quote')
                        
                    }
                    const data = await response.json()
                    setPrice(data.bars?.[company.ticker?.replace("-", ".")]?.[0]?.c)
                
                } catch (error) {
                    console.error('Error retrieving price', error)
                }
            };

            const fetchShares = async () => {
                setQuery('');
                setSuggestions([])
                if (company){
                    try {
                        const response = await fetch(`shares/${company.id}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                        });
                        
                        if (!response.ok) {
                            throw new Error('Failed to find shares');
                        }
                
                        const data = await response.json();
                        setShares(data[0]?.historical_shares);
                    
                    } catch (error) {
                        console.error('Error searching shares:', error);
                    }
                }
            };
            const fetchFilings = async () => {
                setFilings([])
                try{
                    const response = await fetch (`filings/${company.cik_10}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Failed to retrieve filings');
                    }
                    const data = await response.json()
                    if (data == {}) {
                        setFilings(["No filings to show."])
                    }
                    setFilings(data)
                } catch (error) {
                    setFilings({})
                    console.error('Error retrieving filings', error)
                }
            }

            document.title = `${company.ticker} - MetaStocks`

            fetchPrice()
            // fetchShares()
            fetchFilings()
        }
    },[company])
    
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
      
        // Extract date components
        const month = String(date.getMonth()).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
      
        // Extract time components
        const hours = String(date.getHours()+5).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
      
        // Format as MM/DD/YYYY @HH:mm:ss
        return `${month}/${day}/${year}`;
      };
       
    return(
        <>
            <form id='company-search-form' className="shadow-md px-10 bg-gray-500" onSubmit={(e)=> {e.preventDefault(); getCompany({ variables: { ticker: e.target.value}})}}>
                <input id='company-input' className="border rounded m-1 font-mono tracking-tighter px-2 bg-gray-200" type='text' value={query} onChange={handleInputChange} placeholder="Company or Ticker" autoComplete="off"/>
            
                {suggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 rounded mt-1 z-10 inline-block shadow-lg max-h-100 overflow-y-auto">
                    {suggestions.map((company) => (
                        <li key={company.id} className="p-1 hover:bg-gray-200 cursor-pointer whitespace-nowrap font-mono text-base" value onClick={() => getCompany({ variables: { ticker: company.ticker}})}>{company.name} - ({company.ticker}) </li>
                    ))}
                    </ul>
                )}
                
                <input id='company-submit-button' className="m-1 border border-black text-sm px-1" type='submit' value="Search"/>
                <div className="flex flex-row w-full pl-2">
                    <h1 id = "co-header" className="font-mono font-bold text-xl">{company ? `${company.ticker} - ${company.name} - $${price}` : "Search for a company"}</h1>
                    <span className="flex flex-row"></span>
                </div>

                
            </form>
            
            <div id="wrapper" className="flex flex-col items-center w-full h-full pb-5">
                <CompanyInfo company={company} filings={filings}/> 
                {/* <Keywords company={company} /> */}
                <Financials company={company} shares={shares} price={price}/>
            </div>
        </>
  );
};