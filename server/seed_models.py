from datetime import datetime
from models import Company, IncomeStatement
from config import db
import json

def calculate_period_days(start_date:str, end_date:str)-> int:
   start = datetime.strptime(start_date, '%Y-%m-%d')
   end = datetime.strptime(end_date, '%Y-%m-%d')
   difference = end - start
   return difference.days

class JsonKeys():
    NET_INCOME_KEYS = {
        'NetIncomeLoss':'net_income',
        'NetIncomeLossAvailableToCommonStockholdersBasic':'net_income',
        'ComprehensiveIncomeAttributableToOwnersOfParent':'net_income' 
    }

    REVENUE_KEYS = {
        'Revenues': 'total_revenue',
        'RevenueFromContractWithCustomerExcludingAssessedTax': 'rev_from_ceat',
        'RevenueFromContractWithCustomerIncludingAssessedTax': 'rev_from_ciat'
    }

    EXPENSE_KEYS = {
        'OperatingIncomeLoss': 'operating_income',
        'CostOfGoodsAndServicesSold': 'cogs',
        'CostOfRevenue': 'cogs',
        'OperatingExpenses': 'operating_expenses',
        'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest': 'income_before_tax',
        'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments': 'income_before_tax'
    }
   
class IncomeStatementSeed():
        
    def create_q4_income_statements(cik:int) -> None:

        """
        Creates a new income statement for Q4 in a given fiscal year (FY).
        Subrtracts Q1, Q2, Q3 net_incomes from FY net_income to get Q4 net_income.

        Args: 
            cik (int): The CIK id for the company.

        Returns:
            None.
        """

        income_statements = IncomeStatement.query.filter(IncomeStatement.company_cik == cik).all()
        end_of_year_incs = []
        
        i = 0
        while i in range(len(income_statements)):
            inc = income_statements[i]
            if inc.period_days is not None and inc.period_days > 300:
                s = income_statements.pop(i)
                end_of_year_incs.append(s)
            i += 1

        for inc in end_of_year_incs:
            end = inc.end
            year = inc.fy
            net_income = inc.net_income
            quarters_sum = 0

            incs = []
            for s in income_statements:
                if s.fy == year and s.period_days < 120:
                    incs.append(s)

            if len(incs) > 3:
                continue
    
            if len(incs) != 3:
                continue
            
            for inc in incs:
                quarters_sum += inc.net_income

            new_inc = IncomeStatement(
                company_cik = inc.company_cik,
                net_income = net_income - quarters_sum,
                fy = year,
                end = end,
                fp = "Q4"
            )

            db.session.add(new_inc)
            db.session.commit()

    def seed_gross_revenue(cik:int):    
        company = Company.query.filter(Company.cik == cik).first()
        income_statements = IncomeStatement.query.filter(IncomeStatement.company_cik == cik).all()

        json_file = None

        try:
            json_file = json.load(open(f'json/CIK{company.cik_10}.json', 'r'))
        except Exception as e:
            print(e)

        if not json_file:
            return

        gaap = json_file.get('facts',{}).get('us-gaap', {})
        
        for inc in income_statements:
            if inc.accn is not None:
                for json_key, db_key in JsonKeys.REVENUE_KEYS.items():
                    units = gaap.get(json_key,{}).get('units',{}).get('USD',[])
                    for unit in units:
                        if inc.accn != unit.get('accn', None):
                            continue

                        if unit.get('fp') == "FY" and calculate_period_days(unit.get('start'), unit.get('end')) < 300:
                            continue
                        
                        setattr(inc, db_key, unit.get('val', 0))

                        db.session.add(inc)
                        db.session.commit()

    def seed_q4_gross_revenue(cik:int):
        income_statements = IncomeStatement.query.filter(IncomeStatement.company_cik == cik).all()
        end_of_year_incs = []
        
        i = 0
        while i in range(len(income_statements)):
            inc = income_statements[i]
            if inc.period_days is not None and inc.period_days > 300:
                s = income_statements.pop(i)
                end_of_year_incs.append(s)
            i += 1

        for eoy_inc in end_of_year_incs:
            total_revenue = eoy_inc.total_revenue
            
            if total_revenue is None:
                continue
            
            year = eoy_inc.fy
            quarter_revenues = 0
            incs = []
            q4 = None
            for s in income_statements:
                if s.fy != year:
                    continue
                if s.fp == "Q4":
                    q4 = s
                    continue

                if s.fp in ('Q1', 'Q2', 'Q3') and s.period_days < 110:
                    incs.append(s)
                    # print(s.total_revenue)

            if len(incs) > 3:
                continue
    
            if len(incs) != 3:
                continue

            for inc in incs:
                if year == 2020:
                    print(f'{inc.total_revenue}')
                
                if inc.total_revenue:
                    quarter_revenues += inc.total_revenue
            
            if quarter_revenues > 0:
                q4.total_revenue = total_revenue - quarter_revenues
                db.session.add(q4)
                db.session.commit()
            
            