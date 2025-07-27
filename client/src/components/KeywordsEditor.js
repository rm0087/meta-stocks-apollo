import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const GET_KEYWORDS = gql`
    query GetKeywords {
        getKeywords {
            id
            word
        }
    }
`
const POST_KEYWORD = gql`
    mutation Mutation($ticker: String, $keywordId: Int) {
        postCoKeyRelationship(ticker: $ticker, keywordId: $keywordId) {
            company_id
            id
            keyword_id
        }
    }
`

export default function KeywordsEditor() {
    const [keyword, setKeyword] = useState({})
    const [keywordElements, setKeywordElements] = useState([]);
    const [tickerInput, setTickerInput] = useState("");
    const [ticker, setTicker] = useState("");

    const { data: keyData } = useQuery(GET_KEYWORDS);

    const [postCoKeyRelationship, { data: coKeyData }] = useMutation(POST_KEYWORD)



    useEffect(() => {
        if (keyData && keyData.getKeywords){
            console.log(keyData.getKeywords[0].word)

            const elements = keyData.getKeywords.map((keyword) => {
                return (
                    <option onClick={() => setKeyword(keyword)} key={keyword.id}>{keyword.word}</option>
                )
            });
            
            setKeywordElements(elements);
        }   
    },[keyData]);

    const handleSubmit = (e) => {
        if (keyword && ticker){
            e.preventDefault();
            console.log(keyword.id)
            postCoKeyRelationship({variables: {ticker: ticker, keywordId: parseInt(keyword.id)}});
            setTicker("");
        }
    }

    // if (loading) return <p>Loading keywords...</p>
    // if (error) return <p>Error: {error.message}</p>

    return (
        <>  
            <div>
                <h1>{ticker}</h1>
                <h1>Keyword Editor</h1>
                <select value={keyword}>
                    {keywordElements}
                </select>
                <br/>
                <h2>Selected keyword: {keyword && keyword.word ? `${keyword.word} (ID: ${keyword.id})` : null}</h2>
                
            </div>
            
            <div>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <input placeholder={"ticker"} value={ticker} onChange={(e) => setTicker(e.target.value)}></input>
                </form>
            </div>
        </>
    );
}