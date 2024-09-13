from WorkFlow import create_workflow, run_sql_agent

def main():
    # Initialize the workflow
    workflow = create_workflow()
    
    # Example input
    input_data = {
        # Add your input data here
    }
    
    # Run the workflow
    result = run_sql_agent(input_data)
    
    print("Workflow result:", result)

if __name__ == "__main__":
    main()