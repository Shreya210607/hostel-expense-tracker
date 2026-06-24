import React, { useState, useEffect } from 'react';

function Dashboard({ onLogout,username }) {
  // 1. Initialized expenses from LocalStorage memory
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem(`hostel_expenses_${username}`);
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  // 2. Initialized monthly goal from LocalStorage memory (Defaults to 5000)
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const savedGoal = localStorage.getItem(`hostel_monthly_goal_${username}`);
    return savedGoal ? parseFloat(savedGoal) : 5000;
  });

  // Toggle states for updating goal
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(monthlyGoal.toString());

  // Form input states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food'); 

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // AUTOMATIC WATCHERS: Keep memory saved
  useEffect(() => {
    localStorage.setItem(`hostel_expenses_${username}`, JSON.stringify(expenses));
  }, [expenses, username]);

  useEffect(() => {
    localStorage.setItem(`hostel_monthly_goal_${username}`, monthlyGoal.toString());
  }, [monthlyGoal, username]);

  // Handle adding a new expense item
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newExpense = {
      id: Date.now(),
      title,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString()
    };

    setExpenses([newExpense, ...expenses]);
    setTitle('');
    setAmount('');
  };

  // FUNCTION TO REMOVE AN ENTRY
  const handleDeleteExpense = (idToDelete) => {
    const updatedExpenses = expenses.filter(item => item.id !== idToDelete);
    setExpenses(updatedExpenses);
  };

  // FUNCTION TO EXPORT ALL LOGS INTO A SPREADSHEET FILE (CSV)
  const handleExportCSV = () => {
    if (expenses.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Title,Category,Amount (INR)\n";

    expenses.forEach(item => {
      const formattedDate = new Date(item.date).toLocaleDateString();
      const cleanTitle = item.title.replace(/,/g, " "); 
      csvContent += `${formattedDate},${cleanTitle},${item.category},${item.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", `Hostel_Expenses_${new Date().getMonth() + 1}_${new Date().getFullYear()}.csv`);
    document.body.appendChild(downloadLink);
    
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // NEW: FUNCTION TO TRIGGER BROWSER NATIVE PRINT STATEMENT LAYOUT
  const handlePrintReport = () => {
    window.print();
  };

  // FUNCTION TO RESET ALL EXPENSE ARRAYS FOR THE NEW MONTH
  const handleResetAllData = () => {
    const confirmReset = window.confirm("Are you sure you want to completely wipe out all logged expenses? This action cannot be undone.");
    if (confirmReset) {
      setExpenses([]);
      localStorage.removeItem(`hostel_expenses_${username}`);
    }
  };

  // --- TIME-BASED ACCUMULATION LOGIC ---
  const now = new Date();

  // 1. Today's Spend calculation
  const todaysExpenses = expenses.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getDate() === now.getDate() &&
           itemDate.getMonth() === now.getMonth() &&
           itemDate.getFullYear() === now.getFullYear();
  });
  const totalToday = todaysExpenses.reduce((sum, item) => sum + item.amount, 0);

  // 2. This Week's Spend (Past 7 days)
  const totalThisWeek = expenses.reduce((sum, item) => {
    const itemDate = new Date(item.date);
    const diffTime = Math.abs(now - itemDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 ? sum + item.amount : sum;
  }, 0);

  // 3. Total Monthly Spend Accumulation
  const totalThisMonth = expenses.reduce((sum, item) => sum + item.amount, 0);

  // --- CONDENSED CORE CATEGORY MATRIX ENGINE ---
  const categoryTotals = {
    Food: { amount: 0, count: 0, color: '#ff9900' },
    Utilities: { amount: 0, count: 0, color: '#4285f4' },
    Entertainment: { amount: 0, count: 0, color: '#ea4335' },
    Medical: { amount: 0, count: 0, color: '#e91e63' },
    Other: { amount: 0, count: 0, color: '#9e9e9e' }
  };

  expenses.forEach(item => {
    const targetCategory = categoryTotals[item.category] ? item.category : 'Other';
    categoryTotals[targetCategory].amount += item.amount;
    categoryTotals[targetCategory].count += 1;
  });

  // --- FILTER ENGINE LOGIC ---
  const filteredExpenses = expenses.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategoryDropdown = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategoryDropdown;
  });

  // --- SYSTEM BUDGET ALERT CONTROLS ---
  let alertMessage = "You're doing great keeping your spending in check!";
  let alertBg = "#e6f4ea";
  let alertColor = "#137333";
  let circularRingColor = "#aa3bff";

  if (totalThisMonth >= monthlyGoal) {
    alertMessage = `STOP SPENDING! You have completely blown past your budget of ₹${monthlyGoal}!`;
    alertBg = "#fce8e6";
    alertColor = "#c5221f";
    circularRingColor = "#c5221f";
  } else if (totalThisMonth >= monthlyGoal * 0.8) {
    alertMessage = `CRITICAL STATUS: You have reached ₹${totalThisMonth.toFixed(0)}! You've consumed over 80% of your ₹${monthlyGoal} budget!`;
    alertBg = "#fef7e0";
    alertColor = "#b06000";
    circularRingColor = "#e67e22";
  } else if (totalThisWeek >= monthlyGoal * 0.5) {
    alertMessage = `FAST PACE WARNING: You spent ₹${totalThisWeek.toFixed(0)} this week alone. That is half your monthly limit!`;
    alertBg = "#fef7e0";
    alertColor = "#b06000";
    circularRingColor = "#e67e22";
  } else if (totalToday >= 500) {
    alertMessage = `Daily Spike Alert: You spent ₹${totalToday.toFixed(0)} today. Pace yourself for the rest of the week!`;
    alertBg = "#e8f0fe";
    alertColor = "#1a73e8";
  }

  // SVG Circular progress configurations
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const percentageFilled = Math.min((totalThisMonth / monthlyGoal) * 100, 100);
  const strokeDashoffset = circumference - (percentageFilled / 100) * circumference;

  const handleSaveGoal = (e) => {
    e.preventDefault();
    const parsed = parseFloat(goalInput);
    if (!isNaN(parsed) && parsed > 0) {
      setMonthlyGoal(parsed);
      setIsEditingGoal(false);
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif", 
      color: '#1a1a1a', 
      background: '#f4f5f7', 
      minHeight: '100vh', 
      boxSizing: 'border-box' 
    }}>
      
      {/* INJECTED CSS CUSTOM PRINT SHEET STYLING MEDIA RULES */}
      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; padding: 0 !important; }
          header, .alert-banner-zone, button, form, .controls-column-wrapper, .filter-box-row, th:nth-child(4), td:nth-child(4) {
            display: none !important; /* Safely hides UI wrappers, buttons and forms on page prints */
          }
          .main-grid-layout { display: block !important; }
          .report-data-column-wrapper { width: 100% !important; }
          .printable-card-block { border: none !important; box-shadow: none !important; padding: 0 !important; margin-bottom: 30px !important; }
          table { width: 100% !important; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>
      
      {/* HEADER BAR */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#ffffff', 
        padding: '15px 30px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
        marginBottom: '25px' 
      }}>
        <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Hostel Expense Dashboard</h2>
        <button onClick={onLogout} style={{ 
          background: '#ff4d4d', 
          color: '#fff', 
          border: 'none', 
          padding: '10px 18px', 
          borderRadius: '8px', 
          fontWeight: '600', 
          cursor: 'pointer' 
        }}>
          Logout
        </button>
      </header>

      {/* SYSTEM STATUS NOTIFICATION BANNER */}
      <div className="alert-banner-zone" style={{ 
        backgroundColor: alertBg, 
        color: alertColor, 
        padding: '15px 20px', 
        borderRadius: '10px', 
        fontWeight: '600', 
        marginBottom: '25px', 
        borderLeft: `6px solid ${alertColor}` 
      }}>
        {alertMessage}
      </div>

      {/* MAIN TWO-COLUMN SPLIT */}
      <div className="main-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* LEFT CONTROL SIDEBAR */}
        <div className="controls-column-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* BUDGET GOAL CARD */}
          <section style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Monthly Budget Goal</h3>
            {isEditingGoal ? (
              <form onSubmit={handleSaveGoal} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input 
                  type="number" 
                  value={goalInput} 
                  onChange={(e) => setGoalInput(e.target.value)}
                  style={{ flexGrow: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
                <button type="submit" style={{ background: '#137333', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
              </form>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#aa3bff' }}>₹{monthlyGoal.toLocaleString()}</span>
                <button onClick={() => setIsEditingGoal(true)} style={{ background: '#eee', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Change Goal</button>
              </div>
            )}
            
            {expenses.length > 0 && (
              <button 
                onClick={handleResetAllData}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#ff4d4d',
                  border: '1px dashed #ff4d4d',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Reset Monthly Log Data
              </button>
            )}
          </section>

          {/* INPUT FORM */}
          <section style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Log New Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px' }}>Expense Title</label>
                <input type="text" placeholder="e.g., Dinner, Exam fee, Clinic" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px' }}>Amount (₹)</label>
                <input type="number" placeholder="Amount spent" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '5px' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                  {Object.keys(categoryTotals).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#aa3bff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Add Expense</button>
            </form>
          </section>
        </div>

        {/* RIGHT METRICS & STATEMENT PANEL */}
        <div className="report-data-column-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* THREE-TIER RUNTIME TIMELINES */}
          <div className="printable-card-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: '15px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Spent Today</span>
              <h2 style={{ margin: '5px 0 0 0', color: totalToday >= 500 ? '#ff4d4d' : '#1a1a1a' }}>₹{totalToday.toFixed(0)}</h2>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600' }}>Spent This Week</span>
              <h2 style={{ margin: '5px 0 0 0' }}>₹{totalThisWeek.toFixed(0)}</h2>
            </div>
            
            {/* CIRCULAR GRAPH ACCUMULATOR CARD */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '15px 20px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#f0f0f0" strokeWidth={strokeWidth} />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    fill="transparent" 
                    stroke={circularRingColor} 
                    strokeWidth={strokeWidth} 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '120px', height: '120px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1a1a1a' }}>{percentageFilled.toFixed(0)}%</span>
                  <span style={{ fontSize: '0.65rem', color: '#666', fontWeight: '600', textTransform: 'uppercase' }}>Used</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Monthly Accumulation</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1a1a1a' }}>
                  ₹{totalThisMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888', borderTop: '1px solid #eee', marginTop: '4px', paddingTop: '4px' }}>
                  Limit: ₹{monthlyGoal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE EXPENSE DISTRIBUTIONS */}
          {totalThisMonth > 0 && (
            <div className="printable-card-block" style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#555', fontSize: '0.95rem' }}>Active Expense Distributions</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px' }}>
                {Object.keys(categoryTotals).map(catName => {
                  const catData = categoryTotals[catName];
                  if (catData.count === 0) return null; 
                  const percentage = (catData.amount / totalThisMonth) * 100;
                  return (
                    <div key={catName} style={{ border: '1px solid #f0f0f0', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#555' }}>{catName}</span>
                        <span style={{ fontSize: '0.75rem', background: '#f0f0f0', padding: '2px 6px', borderRadius: '10px', color: '#666' }}>
                          x{catData.count}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>₹{catData.amount.toFixed(0)}</div>
                      <div style={{ width: '100%', height: '5px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: catData.color, borderRadius: '3px' }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px', textAlign: 'right' }}>
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TRANSACTION LOG */}
          <div className="printable-card-block" style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0 }}>Today's Transaction Record</h3>
                {expenses.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleExportCSV} style={{ background: '#137333', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                      Export CSV
                    </button>
                    {/* THE NEW PRINT / PDF REPORT GENERATION BUTTON */}
                    <button onClick={handlePrintReport} style={{ background: '#4285f4', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                      Print Report
                    </button>
                  </div>
                )}
              </div>
              
              {/* SEARCH & FILTER CONTROLS */}
              <div className="filter-box-row" style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Search title..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                />
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem', backgroundColor: '#fff' }}
                >
                  <option value="All">All Categories</option>
                  {Object.keys(categoryTotals).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {filteredExpenses.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>No matching transactions found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f0f0f0', color: '#666', fontSize: '0.9rem' }}>
                      <th style={{ padding: '10px' }}>Title</th>
                      <th style={{ padding: '10px' }}>Category</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '12px 10px', fontWeight: '500' }}>{item.title}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ background: '#f4f5f7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{item.category}</span>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '600', color: '#ff4d4d' }}>
                          - ₹{item.amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDeleteExpense(item.id)}
                            style={{ 
                              background: 'transparent', 
                              color: '#ff4d4d', 
                              border: '1px solid #ff4d4d', 
                              borderRadius: '4px', 
                              padding: '4px 8px', 
                              fontSize: '0.8rem', 
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;