from config import db, app
from seed_models import IncomeStatementSeed
from models import Company

def main():
    with app.app_context():
        
        companies = Company.query.filter(Company.id <= 100).all()
        for co in companies:
            print(co.id, co.name)
            IncomeStatementSeed.create_q4_income_statements(co.cik)
            IncomeStatementSeed.seed_gross_revenue(co.cik)
            IncomeStatementSeed.seed_q4_gross_revenue(co.cik)

if __name__ == '__main__':
    main()