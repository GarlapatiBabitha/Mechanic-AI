import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";
import Navbar from "../Navbar/Navbar";
import { assets } from "../../assets/assets";
import botResponses from "../../assets/botResponses.json";
import ChatAPI from "../../config/ChatAPI";
import {account,ID }from '../Auth/appwrite';

const Main = ({ user, onLogout }) => {
  const [input, setInput] = useState("");
  const [cardMessages, setCardMessages] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(user?.$id || "");
  const[userName,setUsername]=useState('');
  const[userEmail,setEmail]=useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await account.get(); // Fetch the logged-in user from Appwrite
        setUserId(user?.$id || null); // Save the userId
        setUsername(user?.name || '');
        setEmail(user?.email || '');
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserId();
  }, [])
  // useEffect(() => {
  //   if (user?.$id) {
  //     setUserId(user.$id);
  //   }
  // }, [user]);

  const getRandomProblemsForCards = () => {
    const keys = Object.keys(botResponses);
    const randomProblems = [];
    while (randomProblems.length < 4) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const randomProblem = botResponses[randomKey];
      if (
        !randomProblems.some((problem) => problem.title === randomProblem.title)
      ) {
        randomProblems.push({ ...randomProblem, key: randomKey });
      }
    }
    return randomProblems;
  };

  const handleSend = async () => {
    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    if (input.trim()) {
      await createNewSession(input.trim());
    }
  };

  const handleCardClick = async (messageKey) => {
    const selectedProblem = botResponses[messageKey];
    const userMessage = selectedProblem.title;
    createNewSession(userMessage);
  };

  const createNewSession = async (message) => {
    console.log(userId);
    const data = await ChatAPI.createSession(userId, message);
    if (!data.success) {
      return alert(data.error);
    }

    navigate(`/chat/${data.sessionId}`, {
      state: { initialMessage: message, fromMain: true },
    });
  };

  useEffect(() => {
    setCardMessages(getRandomProblemsForCards());
  }, [setCardMessages]);

  return (
    <div className="main">
      {/* <Navbar user={user} onLogout={onLogout} /> */}
      <Navbar user={{ email: userEmail || 'Unknown User' }} onLogout={onLogout} />
      <div className="main-container">
        <div className="greet">
          <p>
            <span>Hello, {userName}</span>
          </p>
          <p>How can I help you today?</p>
        </div>
        <div className="cards">
          {cardMessages.map((card, index) => (
            <div
              key={index}
              className="card"
              onClick={() => handleCardClick(card.key)}
            >
              <p>{card.title}</p>
              <img src={assets[card.icon]} alt={`${card.title} Icon`} />
            </div>
          ))}
        </div>
        <div className="main-bottom">
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter your problem here"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              ref={inputRef}
            />
            <div className="send-icon" onClick={handleSend}>
              <img src={assets.send_icon} alt="Send Icon" />
            </div>
          </div>
          <p className="bottom-info">AI may provide inaccurate info</p>
        </div>
      </div>
    </div>
  );
};

export default Main;






