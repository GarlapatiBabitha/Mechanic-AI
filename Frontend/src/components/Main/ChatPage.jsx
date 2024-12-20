




import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./Main.css";
import Navbar from "../Navbar/Navbar";
import { assets } from "../../assets/assets";
import ChatAPI from "../../config/ChatAPI";

const ChatPage = ({ user, onLogout }) => {
  const { state } = useLocation();
  const navigate = useNavigate(); // To reset state after processing
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);
  const { sessionId } = useParams();
  const [userId, setUserId] = useState(user?.$id || "");
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (user?.$id && !userId) {
      setUserId(user.$id);
    }
  }, [user, userId]);

  // const handleBotResponse = useCallback(async (userInput) => {
  //   try {
  //     const data = await ChatAPI.addMessage(userId, sessionId, userInput);
  //     console.log("Bot API Response:", data);
  //     if (!data.success) {
  //       alert(data.error || "An unknown error occurred");
  //       return;
  //     }
  //     const botMessage = {
  //       sender: "bot",
  //       message: data.response || "No response received",
  //     };
  //     setMessages((prevMessages) => [...prevMessages, botMessage]);
  //   } catch (error) {
  //     console.error("Error in bot response:", error);
  //     alert("Failed to send message. Please try again.");
  //   }
  // }, [userId, sessionId]);
  
  const isProcessingResponse = useRef(false); // Add this ref

  const handleBotResponse = useCallback(async (userInput) => {
    if (isProcessingResponse.current) return; // Prevent re-entry
    isProcessingResponse.current = true;
  
    try {
      const data = await ChatAPI.addMessage(userId, sessionId, userInput);
      console.log("Bot API Response:", data);
      if (!data.success) {
        alert(data.error || "An unknown error occurred");
        return;
      }
      const botMessage = {
        sender: "bot",
        message: data.response || "No response received",
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error in bot response:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      isProcessingResponse.current = false; // Reset the flag
    }
  }, [userId, sessionId]);
  

  
  useEffect(() => {
    const initializeChat = async () => {
      if (hasInitialized) return; // Prevent multiple initializations

      if (state?.initialMessage && state?.fromMain) {
        // Handle fresh navigation from Main
        const initialMessage = {
          sender: "user",
          message: state.initialMessage,
        };
        setMessages([initialMessage]);
        await handleBotResponse(state.initialMessage);
        setHasInitialized(true);

        // Clear state after processing to avoid repeated requests on reload
        navigate(".", { replace: true, state: {} });
      } else {
        // Fetch chat history if no initialMessage in state
        try {
          const data = await ChatAPI.getHistory(userId, sessionId);
          if(!data.success){
            return alert(data.error);
          }
          setMessages(data.conversation);
          setHasInitialized(true);
        } catch (error) {
          console.error("Error fetching conversation history:", error);
        }
      }
    };

    if (userId && sessionId) {
      initializeChat();
    }
  }, [userId, sessionId, state, handleBotResponse, hasInitialized, navigate]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { sender: "user", message: input };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");
      await handleBotResponse(input.trim());
    }
  };

  return (
    <div className="main">
      <Navbar user={user} onLogout={onLogout} />
      <div className="main-container">
        <div className="chat-section" ref={chatRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-row ${
                message.sender === "user" ? "user-row" : "bot-row"
              }`}
            >
              {message.sender === "bot" && (
                <img
                  src={assets.gemini_icon}
                  alt="Bot Icon"
                  className="message-icon"
                />
              )}
              <div
                className={`message ${
                  message.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                <p>{message.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="main-bottom">
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter your message here"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <div onClick={handleSend}>
              <img src={assets.send_icon} alt="Send Icon" />
            </div>
          </div>
          <p className="bottom-info">AI may provide inaccurate info</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;




