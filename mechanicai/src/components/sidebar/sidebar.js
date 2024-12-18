



import React, { useEffect, useState, useRef } from "react";
import "./sidebar.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { account } from "../../appwrite";

const Sidebar = ({ onNewChat, onChatSelect }) => {
  const [extended, setExtended] = useState(false);
  const [chats, setChats] = useState([]); // Chat sessions
  const [selectedChat, setSelectedChat] = useState(null); // Selected chat details
  const [loading, setLoading] = useState(false); // Loading state
  const [userId, setUserId] = useState(null); // User ID
  const [offset, setOffset] = useState(0); // Offset for chat pagination
  const [hasMore, setHasMore] = useState(true); // Flag to check if more chats are available
  const [menuOpen, setMenuOpen] = useState(null); // Track open menu for each chat
  const dropdownRef = useRef(null); // Reference to dropdown
  const [editingTitle, setEditingTitle] = useState(null); // Track which chat is being renamed
  const [newTitle, setNewTitle] = useState(""); // Store the new title input

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await account.get(); // Fetch the logged-in user from Appwrite
        setUserId(user?.$id || null); // Save the userId
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserId();
  }, []);

  // Fetch chat sessions with pagination
  const fetchChats = async (loadMore = false) => {
    if (!userId || loading || (!hasMore && loadMore)) return;

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/chats", {
        userId,
        offset,
      });
      const { chatList, offset: newOffset } = response.data;

      if (loadMore) {
        setChats((prevChats) => [...prevChats, ...chatList]); // Append new chats
      } else {
        setChats(chatList); // Set initial chats
      }

      setOffset(newOffset); // Update offset for the next call
      setHasMore(chatList.length === 10); // If less than 10 items, no more chats
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  const fetchChatDetails = async (chatId) => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/history", {
        userId,
        sessionId: chatId,
      });
      if (response.data && response.data.conversation) {
        onChatSelect(response.data.conversation); // Pass conversation to App
        setSelectedChat(chatId); // Mark as selected
      } else {
        console.error("Invalid response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching chat details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (chatId) => {
    setMenuOpen((prev) => (prev === chatId ? null : chatId)); // Toggle the dropdown
  };

const handleRename = async (chatId) => {
    if (newTitle.trim()) {
      // Optimistic update: Immediately change the title locally
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.sessionId === chatId ? { ...chat, title: newTitle } : chat
        )
      );
  
      try {
        // Send the new title to the backend
        const response = await axios.post("http://localhost:5000/api/title", {
          userId,
          sessionId: chatId,
          title: newTitle,
        });
  
        if (response.data.success) {
          // Update the UI only if the backend operation is successful
          setEditingTitle(null); // Close the rename input field
          setNewTitle(""); // Clear the input
          setMenuOpen(null); // Close the dropdown menu after renaming
        } else {
          console.error("Error renaming chat:", response.data.error);
          // Optionally revert the title if the backend fails
        }
      } catch (error) {
        console.error("Error renaming chat:", error);
        // Optionally revert the title if the request fails
      }
    }
  };
  
  const handleDelete = async (chatId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/delete", {
        userId: userId,
        sessionId: chatId,
      });

      // Handle 204 status separately
      if (response.status === 204) {
        console.log("Chat deleted successfully!");

        // Update the chats in the UI
        setChats((prevChats) => prevChats.filter((chat) => chat.sessionId !== chatId));

        // Deselect the chat if it was selected
        if (selectedChat === chatId) {
          setSelectedChat(null);
          onChatSelect(null);
        }

        // Close the dropdown menu
        setMenuOpen(null);

        return; // Exit function after successful deletion
      }

      // For other statuses, check the response data
      if (response?.data?.success) {
        console.log("Chat deleted successfully!");
        setChats((prevChats) => prevChats.filter((chat) => chat.sessionId !== chatId));
        if (selectedChat === chatId) {
          setSelectedChat(null);
          onChatSelect(null);
        }
        setMenuOpen(null);
      } else {
        console.error("Error deleting chat:", response?.data?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting chat:", error.message);
      console.error("Full error object:", error.response?.data || error);
    }
  };

  return (
    <div className="sidebar">
      <div className="top">
        <img
          onClick={() => setExtended((prev) => !prev)}
          className="menu"
          src={assets.menu_icon}
          alt="menu"
        />
        <div className="new-chat" onClick={onNewChat}>
          <img src={assets.plus_icon} alt="new chat" />
          {extended ? <p>New Chat</p> : null}
        </div>
      </div>

      {extended && (
        <div className="recent">
          <p className="recent-title">Recent</p>
          <div className="recent-list">
            {chats.map((chat) => (
              <div key={chat.sessionId} className="recent-entry">
                <div
                  className={`chat-content ${selectedChat === chat.sessionId ? "selected" : ""}`}
                  onClick={() => fetchChatDetails(chat.sessionId)}
                >
                  {editingTitle === chat.sessionId ? (
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={() => setEditingTitle(null)} // Blur to exit rename mode
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleRename(chat.sessionId);
                      }}
                      autoFocus
                    />
                  ) : (
                    <p>{chat.title || "Untitled Chat"}</p>
                  )}
                </div>
                <div className="menu-icon" ref={dropdownRef}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent immediate closing
                      handleMenuClick(chat.sessionId);
                    }}
                  >
                    <circle cx="12" cy="5" r="2" fill="black" />
                    <circle cx="12" cy="12" r="2" fill="black" />
                    <circle cx="12" cy="19" r="2" fill="black" />
                  </svg>
                  {menuOpen === chat.sessionId && (
                    <div
                      className="menu-dropdown"
                      onClick={(e) => e.stopPropagation()} // Prevent outside click handler
                    >
                      <button onClick={() => setEditingTitle(chat.sessionId)}>Rename</button>
                      <button onClick={() => handleDelete(chat.sessionId)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {hasMore && !loading && (
            <button className="load-more" onClick={() => fetchChats(true)}>
              Load More
            </button>
          )}
          {loading && <p>Loading more chats...</p>}
          {!hasMore && <p>No more chats available</p>}
        </div>
      )}
    </div>
  );
};

export default Sidebar;




















