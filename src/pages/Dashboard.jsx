import React from 'react';

// react router dom imports
import { Link } from "react-router-dom";

// react router dom imports
import { useLoaderData } from 'react-router-dom';

// library imports
import { toast } from "react-toastify";

// components
import AddBudgetForm from '../components/AddBudgetForm';
import AddExpenseForm from '../components/AddExpenseForm';
import Intro from '../components/Intro';
import BudgetItem from '../components/BudgetItem';
import Table from '../components/Table';

// helper functions
import { createBudget, createExpense, deleteItem, fetchData, waait } from '../helpers';

// loader
export function dashboardLoader() {
    const userName = fetchData("userName");
    const budgets = fetchData("budgets");
    const expenses = fetchData("expenses");

    return { userName, budgets, expenses };
}

// action
export async function dashboardAction({request}) {
    await waait();

    const data = await request.formData();
    //const userName = data.get("userName");
    //console.log(userName);

    const { _action, ...values} = Object.fromEntries(data);

    // different forms are embedded in Dashboard, so we need to know which form was submitted
    // new user submission
    if(_action === "newUser") {
        try{
            localStorage.setItem("userName", JSON.stringify(values.userName));
            return toast.success(`Welcome, ${values.userName}`);
        } catch(e) {
            throw new Error("There was a problem creating your account.")
        }
    }    

    if(_action === "createBudget") {
        try {
            // create budget
            createBudget({
                name: values.newBudget,
                amount: values.newBudgetAmount
            });

            return toast.success("Budget created!")
        } catch(e) {
            throw new Error("There was a problem creating your budget.")
        }
    }

    if(_action === "deleteExpense") {
        try {
            // delete Expense
            deleteItem({
                key: "expenses",
                id: values.expenseId
            })

            return toast.success("Expense deleted!");
        } catch(e) {
            throw new Error("There was a problem deleting your expense.");
        }
    }

    if(_action === "createExpense") {
        try {
            // create Expense
            createExpense({
                name: values.newExpense,
                amount: values.newExpenseAmount,
                budgetId: values.newExpenseBudget
            })

            return toast.success(`Expense ${values.newExpense} added!`);
        } catch(e) {
            throw new Error("There was a problem adding your expense.");
        }
    }
}

const Dashboard = () => {
    const {userName, budgets, expenses} = useLoaderData()

    return (
        <>
            {userName ? (
                <div className="dashboard">
                    <h1>Welcome back, <span className="accent">{userName}</span></h1>
                    <div className="grid-sm">
                        {
                            budgets && budgets.length > 0 ? (
                                <div className="grid-lg">
                                    <div className="flex-lg">
                                        <AddBudgetForm />
                                        <AddExpenseForm budgets={budgets} />
                                    </div>
                                    <h2>Existing Budgets</h2>
                                    <div className="budgets">
                                        {
                                            budgets.map((budget) => (
                                                <BudgetItem key={budget.id} budget={budget} />
                                            ))
                                        }
                                    </div>
                                    {
                                        expenses && expenses.length > 0 && (
                                            <div className="grid-md">
                                                <h2>Recent Expenses</h2>
                                                <Table 
                                                    expenses={expenses
                                                        .sort((a, b) => b.createdAt - a.createdAt)
                                                        .slice(0, 8)
                                                    } 
                                                />
                                                {expenses.length > 8 && (
                                                    <Link
                                                        to="expenses"
                                                        className="btn btn--dark"
                                                    >
                                                        View all expenses
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    }
                                </div>
                            ) : (
                                <div className="grid-sm">
                                    <p>Personal Budgeting is the secret to financial freedom.</p>
                                    <p>Create a budget to get started.</p>
                                    <AddBudgetForm />
                                </div>
                            )
                            
                        }
                        
                    </div>
                </div>
            ) : <Intro />}  
        </>
    )
}

export default Dashboard
