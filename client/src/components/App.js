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
const GET_FILINGS = gql`
    query GetCompanyFilings($cik_10: String!) {
        getCompanyFilings(cik_10: $cik_10) {
            fin {
                accn
                doc
                filingDate
                form
                fullFilingUrl
                reportDate
                txt
                urlPrefix
            }
            insiders {
                accn
                doc
                filingDate
                form
                fullFilingUrl
                reportDate
                txt
                urlPrefix
            }
            institutions {
                accn
                doc
                filingDate
                form
                fullFilingUrl
                reportDate
                txt
                urlPrefix
            }
            latest {
                accn
                doc
                filingDate
                form
                fullFilingUrl
                reportDate
                txt
                urlPrefix
            }
        }
    }
`
const GET_SUGGESTIONS = gql`
    query GetSuggestions($query: String!) {
        getSuggestions(query: $query) {
            name
            ticker
        }
    }

`
export default function App() {
    const [company, setCompany] = useState('');
    const [query, setQuery] = useState('');  // The current value of the search input
    const [suggestions, setSuggestions] = useState([]);  // The list of company suggestions
    const [price, setPrice] = useState(0);
    const [shares, setShares] = useState(0);
    const [filings, setFilings] = useState({});
    const serverUrl = "https://meta-stocks-demo.onrender.com";
    
    const [getCompany, { loading: coLoading, error: coError, data: coData }] = useLazyQuery(GET_COMPANY, {
        onCompleted: (data) => {
            if (data && data.getCompany){
                setCompany(data.getCompany)
            }
        }
    });
    
    const [getCompanyFilings, { loading: filLoading, error: filError, data: filData }] = useLazyQuery(GET_FILINGS, {
        onCompleted: (data) => {
            if (data && data.getCompanyFilings) {
                setFilings(data.getCompanyFilings);
            }
        },
        onError: (error) => {
            console.error("Filings query error:", error);
        }
    });

    const [getSuggestions, { loading: sugLoading, error: sugError, data: sugData}] = useLazyQuery(GET_SUGGESTIONS,{
        onCompleted: (data) => {
            if (data && data.getSuggestions) {
                setSuggestions(data.getSuggestions)
            }
        }
    });

    useEffect(()=>{
        if (coData && coData.getCompany) {
            // setCompany(coData.getCompany)
            setQuery("")
            setSuggestions("") 
        }
    },[coData])

    useEffect(() => {
        if (company && company.cik_10) {
          console.log("Fetching filings for cik_10:", company.cik_10);
          getCompanyFilings({ 
            variables: { cik_10: company.cik_10 }
          });
        }
      }, [company, company.cik_10, getCompanyFilings]);

    useEffect(()=>{
        if (query) {
            getSuggestions({
                variables: { query: query}
            })
        }
    },[query])

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

            document.title = `${company.ticker} - MetaStocks`

            fetchPrice()
        }
    },[company])

    const handleSumbit = (e) => {
        e.preventDefault(); 
        getCompany({ variables: { ticker: query}});
        setQuery("")
        setSuggestions("")
    }

    const handleInputChange = (event) => {
        const searchQuery = event.target.value;
        setQuery(searchQuery);

        // If the query is empty, clear suggestions
        if (searchQuery.trim().length === 0) {
            setSuggestions([]);
            return;
        };
    };
    
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
            <form id='company-search-form' className="shadow-md px-10 bg-gray-500" onSubmit={(e)=> {handleSumbit(e)}}>
                <input id='company-input' className="border rounded m-1 font-mono tracking-tighter px-2 bg-gray-200" type='text' value={query} onChange={handleInputChange} placeholder="Company or Ticker" autoComplete="off"/>
            
                {suggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 rounded mt-1 ml-16 z-10 inline-block shadow-lg max-h-100 overflow-y-auto">
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