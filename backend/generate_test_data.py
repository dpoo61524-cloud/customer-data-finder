import pandas as pd

def generate_mock_data():
    # Sheet 1: Core Customers
    df_customers = pd.DataFrame({
        "CustomerID": ["C-1001", "C-1002", "C-1003", "C-1004", "C-1005"],
        "Name": ["Alice Johnson", "Bob Smith", "Charlie Brown", "David Miller", "Alice Cooper"],
        "Email": ["alice.j@example.com", "bob.s@example.com", "charlie.b@example.com", "david.m@example.com", "cooper@example.com"],
        "Country": ["USA", "Canada", "UK", "Germany", "USA"]
    })

    # Sheet 2: Active Orders (Note that columns differ slightly but "Name" is shared)
    df_orders = pd.DataFrame({
        "OrderID": ["O-9001", "O-9002", "O-9003", "O-9004"],
        "Name": ["Alice Johnson", "Charlie Brown", "Alice Johnson", "David Miller"],
        "Product": ["Laptop", "Smartphone", "Monitor", "Headphones"],
        "Amount": [1200, 800, 300, 150]
    })

    # Sheet 3: Support Tickets (using "Name" column again)
    df_support = pd.DataFrame({
        "TicketID": ["T-201", "T-202", "T-203"],
        "Name": ["Bob Smith", "Alice Cooper", "Charlie Brown"],
        "Issue": ["Login issue", "Subscription billing error", "Product shipping delay"],
        "Status": ["Closed", "Open", "In Progress"]
    })

    # Save all to a single Excel file in workspace root
    output_path = "../sample_customers.xlsx"
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df_customers.to_excel(writer, sheet_name="Customers", index=False)
        df_orders.to_excel(writer, sheet_name="Orders", index=False)
        df_support.to_excel(writer, sheet_name="Support Tickets", index=False)

    print(f"Mock Excel file generated at: {output_path}")

if __name__ == "__main__":
    generate_mock_data()
