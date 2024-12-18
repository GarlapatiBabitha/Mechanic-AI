



import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import Main from "./components/main/main";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import { account } from "./appwrite";
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [resetChat, setResetChat] = useState(false);
  const [selectedChatConversation, setSelectedChatConversation] = useState([]);

  // This useEffect hook is outside of any conditionals and will always be called
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await account.get();
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Not logged in or session expired", error);
      } finally {
        setLoading(false); // Stop loading after session check
      }
    };

    checkSession();
  }, []); // Empty dependency array to run this only once after the first render


  if (loading) {
    return (
      <div className="loading">
        <img
          src="/loading.gif" // Path to the loading GIF in the public folder
          alt="Loading..."
          className="loading-gif"
        />
        <h5>Loading</h5>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setIsAuthenticated(false);
      alert("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const handleNewChat = () => {
    setResetChat((prev) => !prev);
    setSelectedChatConversation([]);
  };

  const handleChatSelection = (conversation) => {
    setSelectedChatConversation(conversation);
  };


  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/signup"
          element={<Signup onSignup={() => setIsAuthenticated(true)} />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Sidebar onNewChat={handleNewChat} onChatSelect={handleChatSelection} />
            <Main
              resetChat={resetChat}
              onLogout={handleLogout}
              previousConversation={selectedChatConversation}
            />
          </>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
















// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Sidebar from "./components/sidebar/sidebar";
// import Main from "./components/main/main";
// import Login from "./components/auth/Login";
// import Signup from "./components/auth/Signup";
// import Loading from "./components/Loading"; // Import the Loading component
// import { account } from "./appwrite";
// import './App.css';

// const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [resetChat, setResetChat] = useState(false);
//   const [selectedChatConversation, setSelectedChatConversation] = useState([]);

//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         const user = await account.get();
//         if (user) {
//           setIsAuthenticated(true);
//         }
//       } catch (error) {
//         console.error("Not logged in or session expired", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkSession();
//   }, []);

//   if (loading) {
//     return <Loading />; // Use the Loading component
//   }

//   const handleLogout = async () => {
//     try {
//       await account.deleteSession("current");
//       setIsAuthenticated(false);
//       alert("Logged out successfully!");
//     } catch (error) {
//       console.error("Logout failed:", error);
//       alert("Logout failed. Please try again.");
//     }
//   };

//   const handleNewChat = () => {
//     setResetChat((prev) => !prev);
//     setSelectedChatConversation([]);
//   };

//   const handleChatSelection = (conversation) => {
//     setSelectedChatConversation(conversation);
//   };

//   if (!isAuthenticated) {
//     return (
//       <Routes>
//         <Route
//           path="/login"
//           element={<Login onLogin={() => setIsAuthenticated(true)} />}
//         />
//         <Route
//           path="/signup"
//           element={<Signup onSignup={() => setIsAuthenticated(true)} />}
//         />
//         <Route path="*" element={<Navigate to="/login" />} />
//       </Routes>
//     );
//   }

//   return (
//     <Routes>
//       <Route
//         path="/"
//         element={
//           <>
//             <Sidebar onNewChat={handleNewChat} onChatSelect={handleChatSelection} />
//             <Main
//               resetChat={resetChat}
//               onLogout={handleLogout}
//               previousConversation={selectedChatConversation}
//             />
//           </>
//         }
//       />
//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// };

// export default App;
