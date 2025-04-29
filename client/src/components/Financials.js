import React, { useEffect, useState } from "react";
import { Bar, Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement } from 'chart.js';
import 'chart.js/auto'
import { useQuery, gql } from "@apollo/client";

const GET_BALANCE_SHEETS = gql`
    query balanceSheets($cik: Int!) {
        companyBalanceSheets(cik: $cik) {
            company_cik
            total_assets
            total_liabilities
            total_stockholders_equity
            end
            cash_and_equiv
            currency
        }
    }
`

const GET_INCOME_STATEMENTS = gql`
    query incomeStatements($cik: Int!) {
        companyIncomeStatements(cik: $cik) {
            company_cik
            net_income
            total_revenue
            operating_income
            end
            currency
        }
    }
`

export default function Financials({company, shares, price}){
    const {loading: bsLoading, error: bsError, data: bsData} = useQuery(GET_BALANCE_SHEETS, {
        variables: { cik: company.cik },
    });

    const { loading: incLoading, error: incError, data: incData} = useQuery(GET_INCOME_STATEMENTS, {
        variables: { cik: company.cik }
    });

    const bsDefaults = {
        assetsData: "", 
        liabilitiesData: "",
        stockholdersData: "",
        cashData: "",
        assetsLabels: "",
    }

    const incDefaults = {
        netIncomeData: "",
        revenueData: "",
        opIncData: "",
        netIncomeLabels: "",
    }

    const [bsObj, setBsObj] = useState(bsDefaults);
    const [incObj, setIncObj] = useState(incDefaults);


    function setMarketCap(shares, price) {
        return shares * price
    };
    
    function formatNumber(num2, digits=3) {
        const num = parseInt(num2)
        
        if (Math.abs(num) >= 1000000000000) {
            return (num / 1000000000000).toFixed(digits) + ' T';
        } else if (Math.abs(num) >= 1000000000) {
            return (num / 1000000000).toFixed(digits) + ' B';
        } else if (Math.abs(num) >= 1000000) {
            return (num / 1000000).toFixed(digits) + ' M';
        } else if (Math.abs(num) >= 1000) {
            return (num / 1000).toFixed(digits) + ' K';
        } else {
            return num.toFixed(0);
        }
    };

    useEffect(() =>{
        if (bsData) {
            setBsObj({ ...bsObj, 
                ['assetsLabels']: bsData.companyBalanceSheets.map(bs => bs.end),
                ['assetsData']: bsData.companyBalanceSheets.map(bs => bs.total_assets),
                ['liabilitiesData']: bsData.companyBalanceSheets.map(bs => bs.total_liabilities),
                ['stockholdersData']: bsData.companyBalanceSheets.map(bs => bs.total_stockholders_equity),
                ['cashData']: bsData.companyBalanceSheets.map(bs => bs.cash_and_equiv),
            })

        } else {
            setBsObj(bsDefaults)
        }
        
        if (incData) {
            setIncObj({ ... incObj,
                ['netIncomeLabels']: incData.companyIncomeStatements.map(inc => inc.end),
                ['netIncomeData']: incData.companyIncomeStatements.map(inc => inc.net_income),
                ['revenueData']: incData.companyIncomeStatements.map(inc => inc.total_revenue),
                ['opIncData']: incData.companyIncomeStatements.map(inc => inc.operating_income)
            })

        } else {
            setIncObj(incDefaults)
        }

    },[bsData, incData])

        
//// 1.) Create data and labels for bar and other charts ////////////////////////////////////////////////////////////////////////////////////////////////
    function lineData(statemenObj){
        return statemenObj
    }

    const incStatementGraphObj = {
        // labels: = An array of dates, 
        // datasets: = An array of objects. Each object defines the settings for each line on the graph.
        labels: incObj.netIncomeLabels,
        datasets: [
            {
                label: 'Net Income',
                data: incObj.netIncomeData,
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                pointBackgroundColor: 'rgb(255, 0, 0)',
                pointBorderColor: 'rgb(0, 0, 0)',
                pointBorderWidth: .5,
                tension: 0.4
            }, 
            {
                label: 'Revenue',
                data: incObj.revenueData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: 'rgb(0, 0, 0)',
                pointBorderWidth: .5,
                tension: 0.4
            },
            {
                label: 'Operating Income',
                data: incObj.opIncData,
                fill: false,
                borderColor: '#ffee00',
                pointBackgroundColor: '#ffee00',
                pointBorderColor: 'rgb(0, 0, 0)',
                pointBorderWidth: .5,
                tension: 0.4
            }
        
        ]
    };

    const balanceSheetDataObj = {
        // labels: = An array of dates, 
        // datasets: = An array of objects. Each object defines the settings for each line on the graph.
        labels: bsObj.assetsLabels,
        datasets: [
            {
                label: 'Assets',
                data: bsObj.assetsData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: 'rgb(0, 0, 0)',
                pointBorderWidth: .5,
                tension: 0.4
            },
            {
                label: 'Liabilities',
                data: bsObj.liabilitiesData,
                fill: false,
                borderColor: 'rgb(255, 0, 0)',
                pointBackgroundColor: 'rgb(255, 0, 0)',
                pointBorderColor: 'rgb(0, 0, 0)',
                pointBorderWidth: .5,
                tension: 0.4
            },
            {
                label: `Stockholders' Equity`,
                data: bsObj.stockholdersData,
                fill: false,
                borderColor: 'rgb(0, 0, 0)',
                pointBackgroundColor: 'rgb(0, 0, 0)',
                pointBorderColor: 'rgb(0, 0, 0)',
                pointBorderWidth: .5,
                tension: 0.4
            },
            {
                label: `Cash and Equivalents`,
                data: bsObj.cashData,
                fill: false,
                borderColor: 'rgb(0, 128, 0)',
                pointBackgroundColor: 'rgb(0, 128, 0)',
                pointBorderColor: 'rgb(0, 0, 0)',
                pointBorderWidth: .5,
                tension: 0.4
            }
        
        ]
    };

    // function cfData(cashFlowsDataObj){
    //     const dataObj = {
    //         labels: labels,
    //         datasets: [
    //             {
    //                 label: 'Operating Cashflows',
    //                 data: data,
    //                 fill: false,
    //                 borderColor: 'rgb(75, 192, 192)',
    //                 pointBackgroundColor: 'rgb(75, 192, 162)',
    //                 pointBorderColor: 'rgb(255, 255, 255)',
    //                 pointBorderWidth: 1,
    //                 tension: 0.3
    //             },
    //             {
    //                 label: 'Investing Cashflows',
    //                 data: data2,
    //                 fill: false,
    //                 borderColor: 'rgb(0, 0, 0)',
    //                 pointBackgroundColor: 'rgb(0, 0, 0)',
    //                 pointBorderColor: 'rgb(255, 255, 255)',
    //                 pointBorderWidth: .5,
    //                 tension: 0.3
    //             },
    //             {
    //                 label: `Financing Cashflows`,
    //                 data: data3,
    //                 fill: false,
    //                 borderColor: 'rgb(255, 0, 0)',
    //                 pointBackgroundColor: 'rgb(255, 0, 0)',
    //                 pointBorderColor: 'rgb(255, 255, 255)',
    //                 pointBorderWidth: .5,
    //                 tension: 0.3
    //             }
    //         ]
    //     }
    //     return dataObj
    // }

    // define options for LINE graphs
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        elements: {
            line: {
                borderWidth: 4,
                capBezierPoints: false,
                lineJoin: 'round',

            },
            point:{
                pointStyle: true,
                radius: 2,
                hoverRadius: 4,
                border: 1
            },
        },

        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#000000',
                    usePointStyle: true,
                    pointStyle: 'rect',
                    font: {
                        family: 'Mono',
                    },
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label1 = context.dataset.label + ': ' + bsData.companyBalanceSheets[0].currency + ' ' + formatNumber(context.parsed.y, 3);
                        return label1;
              }
            }
          },
          
        },
        scales: {
            x: {
                ticks: {
                    stepSize: 5,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0)' // Adjust alpha (opacity) here
                }
            },
            y: {
                ticks: {
                    callback: function(label, index, values) {
                        return "$" + "" + formatNumber(label,1);
                    },
                    autoSkip: false
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.15)', // Adjust alpha (opacity) here
                    offset: false
                }
            }
        },
    }
    
    // Define data for BAR graphs
    function barData(labels, data, dataSetLabel, backgroundColor = 'rgba(75, 192, 192, 0.2)', borderColor = 'rgba(75, 192, 192, 1)', borderWidth = 1){
        const dataObj = {
            labels: labels, // X-axis labels
            datasets: [
                {
                    label: dataSetLabel, // Label for the dataset
                    data: data, // Y-axis data
                    backgroundColor: backgroundColor, // Bar color
                    borderColor: borderColor, // Bar border color
                    borderWidth: borderWidth, // Bar border width
                },
            ],
        };
        return dataObj
    }

    // Define options for BAR graphs
    function barOptions(header){
        const optionsObj = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top', // Position of the legend
                },
                title: {
                    display: true,
                    text: header, // Title of the chart
                },
            },
        };
        return optionsObj
    }


//// 2.) Render component in JSX ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    return(
        <>   
            <div id ="cash-graph-div" className="md:grid grid-cols-2 gap-4 place-items-center mt-5 w-full h-full font-mono text-lg">
                <div className = "border-2 rounded w-[90%] h-full">
                    <div className="flex flex-row">
                        <div className="w-1/3 text-sm p-3">
                            <div className="flex flex-row"><span className="font-bold">Assets:</span><span className="text-right">{bsObj.assetsData && formatNumber(bsObj.assetsData[bsObj.assetsData.length -1])}</span></div>
                            <div className="flex flex-row"><span className="font-bold">Liabilities:</span><span className="text-right">{bsObj.liabilitiesData && formatNumber(bsObj.liabilitiesData[bsObj.liabilitiesData.length -1])}</span></div>
                            <div className="flex flex-row"><span className="font-bold">S/H Equity:</span><span className="text-right">{bsObj.stockholdersData && formatNumber(bsObj.stockholdersData[bsObj.stockholdersData.length -1])}</span></div>
                        </div>
                        <div className="w-1/3 p-1">
                            <h2 className="text-center font-bold">Balance Sheet History</h2>
                            <h3 className="text-center text-sm">{company? company.name : "Company"}</h3>
                            <h3 className="text-center text-xs">As of: {bsObj.assetsLabels && bsObj.assetsLabels[bsObj.assetsLabels.length -1]}</h3>
                        </div>
                        <div className="w-1/3 text-sm p-3 flex justify-end">
                            <div className="flex flex-row"><span className="font-bold">Cash:</span><span>{bsObj.cashData && formatNumber(bsObj.cashData[bsObj.cashData.length -1])}</span></div>
                        </div>
                    </div>
                    <Line data={balanceSheetDataObj} options={options}/>
                </div>
                <div className = "border-2 rounded w-[90%] h-full">
                    <div className="flex flex-row">
                        <div className="w-1/3 text-sm p-3">
                            <div className="flex flex-row"><span className="font-bold">Revenue:</span><span className="text-right">{incObj.revenueData && formatNumber(incObj.revenueData[incObj.revenueData.length -1])}</span></div>
                            <div className="flex flex-row"><span className="font-bold">Operating Income:</span><span className="text-right">{incObj.opIncData && formatNumber(incObj.opIncData[incObj.opIncData.length -1])}</span></div>
                            <div className="flex flex-row"><span className="font-bold">Net Income:</span><span className="text-right">{incObj.netIncomeData && formatNumber(incObj.netIncomeData[incObj.netIncomeData.length -1])}</span></div>
                        </div>
                        <div className="w-1/3 p-1">
                            <h2 className="text-center font-bold">Income Statement History</h2>
                            <h3 className="text-center text-sm">{company? company.name : "Company"}</h3>
                            <h3 className="text-center text-xs">As of: {incObj.netIncomeLabels && incObj.netIncomeLabels[incObj.netIncomeLabels.length -1]}</h3>
                        </div>
                        <div className="w-1/3 text-sm p-3 flex justify-end">
                            
                        </div>
                    </div>
                    
                    <Line data={incStatementGraphObj} options={options}/>
                </div>

                {/* <div className = "border border-white rounded w-[90%] h-full">
                    <h2 className="text-center font-bold">Cashflows History</h2>
                    <Line data={cfData(opCfLabels, opCfData, invCfData, finCfData,)} options={options}/>
                </div> */}

            </div>  
        </>
    )
}