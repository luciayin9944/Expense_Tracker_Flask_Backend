// ExpenseList.js
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Box, Button } from "../styles";
import Pagination from "../components/Pagination";

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    purchase_item: "",
    category: "",
    amount: "",
    date: ""
  });
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", currentPage);
    queryParams.append("per_page", 5);
    if (filterYear) queryParams.append("year", filterYear);
    if (filterMonth) queryParams.append("month", filterMonth);
  

    fetch(`/expenses?${queryParams.toString()}`, {
    //fetch(`/expenses/filter?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error("Failed to fetch");
      })
      .then((data) => {
        setExpenses(data.expenses || []);
        setTotalPages(data.total_pages || 1);
      })
      .catch((err) => {
        console.error("Error fetching expenses:", err);
        setExpenses([]);
      });
  }, [filterYear, filterMonth, currentPage]);


  function handleEditFormChange(e) {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  }


  function handleFilter() {
    setCurrentPage(1); // 重置到第一页
  }



  function handleEdit(expense) {
    setEditingId(expense.id);
    setEditFormData({
      purchase_item: expense.purchase_item,
      category: expense.category,
      amount: expense.amount,
      date: expense.date.slice(0, 10),
    });
  }

  function handleEditSubmit(id) {
    fetch(`/expenses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(editFormData),
    })
      .then((r) => r.ok ? r.json() : Promise.reject("Update failed"))
      .then((updated) => {
        setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
        setEditingId(null);
      })
      .catch((err) => alert(err));
  }

  function handleDelete(id) {
    fetch(`/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((r) => {
      if (r.ok) setExpenses((prev) => prev.filter((e) => e.id !== id));
    });
  }

  return (
    <div>
      <FilterWrapper>
        <Button onClick={() => handleFilter()}>Filter</Button>
        <label>
          Year:
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">All</option>
            {["2022", "2023", "2024", "2025"].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
        <label>
          Month:
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="">All</option>
            {[...Array(12)].map((_, i) => {
              const val = String(i + 1).padStart(2, "0");
              return <option key={val} value={val}>{val}</option>;
            })}
          </select>
        </label>
      </FilterWrapper>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: "bold" }}>Total: ${totalExpense.toFixed(2)}</p>
        <Button as={Link} to="/summary">View Summary</Button>
      </div>

      <Wrapper>
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id}>
            <Box>
              {editingId === expense.id ? (
                <EditForm>
                  <input name="purchase_item" value={editFormData.purchase_item} onChange={handleEditFormChange} />
                  <select name="category" value={editFormData.category} onChange={handleEditFormChange}>
                    {["Food", "Clothing", "Utilities", "Home", "Travel", "Entertainment", "Health", "Other"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input name="amount" type="number" value={editFormData.amount} onChange={handleEditFormChange} />
                  <input name="date" type="date" value={editFormData.date} onChange={handleEditFormChange} />
                  <Button onClick={() => handleEditSubmit(expense.id)}>Save</Button>
                  <Button onClick={() => setEditingId(null)}>Cancel</Button>
                </EditForm>
              ) : (
                <>
                  <h2>{expense.purchase_item}</h2>
                  <p>
                    📂 {expense.category} <br />
                    💵 ${expense.amount} <br />
                    📅 {new Date(expense.date).toLocaleDateString()} <br />
                  </p>
                  <Button onClick={() => handleEdit(expense)}>Edit</Button>
                  <Button onClick={() => handleDelete(expense.id)}>Delete</Button>
                </>
              )}
            </Box>
          </ExpenseCard>
        ))}
      </Wrapper>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(pageNum) => setCurrentPage(pageNum)}
      />
    </div>
  );
}

const Wrapper = styled.section`
  max-width: 800px;
  margin: 40px auto;
`;

const ExpenseCard = styled.article`
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f6f8fa;
  border-radius: 12px;
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  input, select {
    padding: 8px;
    font-size: 16px;
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 20px auto;
`;

export default ExpenseList;





















// import { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import styled from "styled-components";
// import { Box, Button } from "../styles";

// function ExpenseList() {
//   const [expenses, setExpenses] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [editFormData, setEditFormData] = useState({
//     purchase_item: "",
//     category: "",
//     amount: "",
//     date: ""
//   });

//   const [filterYear, setFilterYear] = useState("");
//   const [filterMonth, setFilterMonth] = useState("")
//   const location = useLocation();

//   const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

//   useEffect(() => {
//     if (location.pathname === "/") {
//       setFilterYear("");
//       setFilterMonth("");
//       fetch("/expenses", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`
//         }
//       })
//         .then((r) => {
//           if (r.ok) {
//             return r.json();
//           } else {
//             throw new Error("Unauthorized or failed to fetch");
//           }
//         })
//         .then((data) => {
//           // console.log("Loaded expenses:", data);
//           setExpenses(data.expenses || []);
//           // //clear filter
//           setFilterYear(""); 
//           setFilterMonth("");
//         })
//         .catch((error) => {
//           console.error("Error fetching expenses:", error);
//           setExpenses([]);
//         });
//     }
//   }, [location]);

//   function handleDelete(id) {
//   fetch(`/expenses/${id}`, {
//     method: "DELETE",
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//   })
//     .then((r) => {
//       if (r.ok) {
//         // Remove the deleted expense from the local state
//         setExpenses((prev) => prev.filter((e) => e.id !== id));
//       } else {
//         console.error("Delete failed");
//       }
//     });
//   } 

//   function handleEdit(expense) {
//     setEditingId(expense.id);
//     setEditFormData({
//       purchase_item: expense.purchase_item,
//       category: expense.category,
//       amount: expense.amount,
//       date: expense.date.slice(0, 10)
//     });
//   }

//   function handleEditFormChange(e) {
//     const { name, value } = e.target;
//     setEditFormData({
//       ...editFormData,
//       [name]: value
//     });
//   }


//   function handleEditSubmit(id) {
//     fetch(`/expenses/${id}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`
//       },
//       body: JSON.stringify(editFormData)
//     })
//     .then((r) => {
//       if (r.ok) return r.json();
//       throw new Error("Failed to update expense");
//     })
//     .then((updatedExpense) => {
//       setExpenses((prev) =>
//         prev.map((e) => (e.id === id ? updatedExpense : e))
//       );
//       setEditingId(null);
//     })
//     .catch((err) => {
//       console.error("Update failed:", err);
//       alert("Error updating expense.");
//     });
//   }

//   function handleCancelEdit() {
//     setEditingId(null);
//   }



//   function handleFilter() {
//     const queryParams = new URLSearchParams();
//     if (filterYear) queryParams.append("year", filterYear);
//     if (filterMonth) queryParams.append("month", filterMonth);

//     fetch(`/expenses/filter?${queryParams.toString()}`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       }
//     })
//     .then((r) => {
//       if (r.ok)
//         return r.json();
//       //else:
//       throw new Error("Filter failed");
//     })
//     .then((data) => {
//       setExpenses(data.expenses || []);
//     })
//     .catch((err) => {
//       console.error("Error filtering:", err);
//     });
//   }




//   return (
//     <div>
//       <FilterWrapper>
//         <Button onClick={handleFilter}>Filter</Button>
//         <label>
//           Year:
//           <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
//             <option value="">All</option>
//             <option value="2022">2022</option>
//             <option value="2023">2023</option>
//             <option value="2024">2024</option>
//             <option value="2025">2025</option>
//           </select>
//         </label>
//         <label>
//           Month:
//           <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
//             <option value="">All</option>
//             {[...Array(12)].map((_, i) => {
//               const value = String(i + 1).padStart(2, "0");
//               return <option key={value} value={value}>{value}</option>;
//             })}
//           </select>
//         </label>
//       </FilterWrapper>

//       <div style={{ textAlign: "center", marginTop: "20px" }}>
//         <p style={{ fontWeight: "bold", margin: "0 0 10px 0" }}>
//           Total Expense: ${totalExpense.toFixed(2)}
//         </p>
//         <Button as={Link} to="/summary">
//           View Summary
//         </Button>
//       </div>

//       <Wrapper>
//         {expenses.length > 0 ? (
//           expenses.map((expense) => (
//             <ExpenseCard key={expense.id}>
//               <Box>
//                 {editingId === expense.id ? (
//                   <EditForm>
//                     <input
//                       type="text"
//                       name="purchase_item"
//                       value={editFormData.purchase_item}
//                       onChange={handleEditFormChange}
//                     />
//                     <select
//                       name="category"
//                       value={editFormData.category}
//                       onChange={handleEditFormChange}
//                     >
//                       <option value="Food">Food</option>
//                       <option value="Clothing">Clothing</option>
//                       <option value="Travel">Travel</option>
//                       <option value="Utilities">Utilities</option>
//                       <option value="Entertainment">Entertainment</option>
//                       <option value="Health">Health</option>
//                       <option value="Other">Other</option>
//                     </select>
//                     <input
//                       type="number"
//                       name="amount"
//                       value={editFormData.amount}
//                       onChange={handleEditFormChange}
//                     />
//                     <input
//                       type="date"
//                       name="date"
//                       value={editFormData.date}
//                       onChange={handleEditFormChange}
//                     />
//                     <Button onClick={() => handleEditSubmit(expense.id)}>
//                       Save
//                     </Button>
//                     <Button onClick={handleCancelEdit}>
//                       Cancel
//                     </Button>
//                   </EditForm>
//                 ) : (
//                   <>
//                     <h2>{expense.purchase_item}</h2>
//                     <p>
//                       📂 Category: {expense.category}
//                       <br />
//                       💵 Amount: ${expense.amount}
//                       <br />
//                       📅 Date: {new Date(expense.date).toLocaleDateString()}
//                       <br />
//                     </p>
//                     <Button onClick={() => handleEdit(expense)}>
//                       Edit
//                     </Button>
//                     <Button onClick={() => handleDelete(expense.id)}>
//                       Delete
//                     </Button>
//                   </>
//                 )}
//                   </Box>
//             </ExpenseCard>
//           ))
//         ) : (
//           <>
//             <h2>No Expense Records Found</h2>
//             <Button as={Link} to="/new">
//               Add a New Expense
//             </Button>
//           </>
//         )}
//       </Wrapper>
//     </div>
//   );
// }

// const Wrapper = styled.section`
//   max-width: 800px;
//   margin: 40px auto;
// `;

// const ExpenseCard = styled.article`
//   margin-bottom: 24px;
//   padding: 16px;
//   background-color: #f6f8fa;
//   border-radius: 12px;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
// `;


// const EditForm = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 10px;

//   input {
//     padding: 8px;
//     border: 1px solid #ddd;
//     border-radius: 4px;
//     font-size: 16px;
//   }
// `;

// const FilterWrapper = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   gap: 16px;
//   margin: 20px auto;
// `;


// export default ExpenseList;

