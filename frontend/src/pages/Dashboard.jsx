

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [tab, setTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState(null); // ✅ for compose

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const [darkMode, setDarkMode] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyAttachment, setReplyAttachment] = useState(null); // ✅ for reply

  const toggleTheme = () => setDarkMode(!darkMode);

  const fetchMessages = useCallback(async () => {
    if (tab === 'compose') return;
    setLoading(true);

    let url = '';
    if (tab === 'inbox') url = `/inbox?page=${page}&limit=${limit}`;
    if (tab === 'sent') url = `/sent?page=${page}&limit=${limit}`;
    if (tab === 'trash') url = `/trash?page=${page}&limit=${limit}`;

    try {
      const res = await axios.get(`http://localhost:3000/api/messages${url}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setMessages(res.data.messages);
      if (tab === 'inbox') setTotal(res.data.total || res.data.messages.length);
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
    setLoading(false);
  }, [tab, page]);

  useEffect(() => {
    fetchMessages();
  }, [tab, page, fetchMessages]);

  // ✅ Send message with attachment
  // const handleSend = async (e) => {
  //   e.preventDefault();
  //   const formData = new FormData();
  //   formData.append('toEmail', toEmail);
  //   formData.append('subject', subject);
  //   formData.append('body', body);
  //   if (attachment) formData.append('attachment', attachment);

  //   await axios.post(
  //     'http://localhost:3000/api/messages/send',
  //     formData,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('token')}`,
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     }
  //   );

  //   alert('Message sent!');
  //   setToEmail('');
  //   setSubject('');
  //   setBody('');
  //   setAttachment(null);
  //   setTab('sent');
  //   fetchMessages();
  // };


const handleSend = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append('toEmail', toEmail);
    formData.append('subject', subject);
    formData.append('body', body);
    if (attachment) formData.append('attachment', attachment);

    await axios.post(
      'http://localhost:3000/api/messages/send',
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    alert('Message sent!');
    setToEmail('');
    setSubject('');
    setBody('');
    setAttachment(null);
    setTab('sent');
    fetchMessages();
  } catch (err) {
    console.error("Send message error:", err.response?.data || err.message);
    alert("❌ Failed to send message. Check console for details.");
  }
};


  // ✅ Reply with attachment
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyingTo) return;

    const formData = new FormData();
    formData.append('originalMessageId', replyingTo._id);
    formData.append('body', replyBody);
    if (replyAttachment) formData.append('attachment', replyAttachment);

    await axios.post(
      'http://localhost:3000/api/messages/reply',
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    alert('Reply sent!');
    setReplyingTo(null);
    setReplyBody('');
    setReplyAttachment(null);
    fetchMessages();
  };

  // ✅ Delete message
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/api/messages/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setMessages(messages.filter((msg) => msg._id !== id));
  };

  // ✅ Mark as read
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    setMessages((prev) =>
      prev.map((msg) => (msg._id === id ? { ...msg, read: true } : msg))
    );

    try {
      await axios.patch(`http://localhost:3000/api/messages/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? { ...msg, read: false } : msg))
      );
    }
  };

  // ✅ Filter messages for search
  const filteredMessages = messages.filter((msg) =>
    msg.fromEmail?.toLowerCase().includes(search.toLowerCase()) ||
    msg.toEmail?.toLowerCase().includes(search.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(search.toLowerCase()) ||
    msg.body?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  const bgColor = darkMode ? '#0f172a' : '#ecfdf5';
  const cardColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#0f172a';
  const accentColor = '#10b981';

  return (
    <div className="d-flex flex-column vh-100" style={{ backgroundColor: bgColor, color: textColor, transition: '0.3s' }}>
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: accentColor }}>
        <div className="navbar-brand text-white ps-4 d-flex align-items-center gap-2">
          <img src="./OIP.webp" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
          <span>Email Client</span>
        </div>
        <div className="ms-auto d-flex gap-3 pe-4 align-items-center">
          <span className="text-white">Hi, {user.username}</span>
          <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
          <button className="btn btn-sm btn-light" onClick={toggleTheme}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </nav>

      <div className="container-fluid flex-grow-1 d-flex p-0">
        {/* Sidebar */}
        <div className="p-3 border-end" style={{ width: '200px', backgroundColor: darkMode ? '#1e293b' : '#f1f5f9' }}>
          <button className={`btn w-100 mb-2 ${tab === 'inbox' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setTab('inbox'); setPage(1); }}>Inbox</button>
          <button className={`btn w-100 mb-2 ${tab === 'sent' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => { setTab('sent'); setPage(1); }}>Sent</button>
          <button className={`btn w-100 mb-2 ${tab === 'trash' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => { setTab('trash'); setPage(1); }}>Trash</button>
          <button className={`btn w-100 mb-2 ${tab === 'compose' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setTab('compose')}>Compose</button>
        </div>

        {/* Main Panel */}
        <div className="flex-grow-1 p-4 overflow-auto">
          {tab === 'compose' ? (
            <div className="card shadow p-4" style={{ backgroundColor: cardColor, color: textColor }}>
              <h4>Compose</h4>
              <form onSubmit={handleSend}>
                <input className="form-control mb-2" placeholder="To Email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} required />
                <input className="form-control mb-2" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                <textarea className="form-control mb-2" placeholder="Body" rows="5" value={body} onChange={(e) => setBody(e.target.value)} required></textarea>
                <input type="file" className="form-control mb-2" onChange={(e) => setAttachment(e.target.files[0])} /> {/* ✅ File input */}
                <button className="btn btn-success">Send</button>
              </form>
            </div>
          ) : (
            <div className="card shadow p-4" style={{ backgroundColor: cardColor, color: textColor }}>
              <h4>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h4>

              {/* Search bar */}
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by email or subject"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p>Loading...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <p className="text-muted">No messages found.</p>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>From</th>
                          {/* <th>To</th> */}
                          <th>Subject</th>
                          <th>Body</th>
                          <th>Date</th>
                          <th>Attachment</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMessages.map((msg) =>{
                        console.log("Message:", msg);
                        return (
                          <tr
                            key={msg._id}
                            className={!msg.read ? 'table-primary fw-bold' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleMarkAsRead(msg._id, msg.read)}
                          >
                            <td>{msg.fromEmail || '-'}</td>
                            {/* <td>{msg.toEmail || '-'}</td> */}
                            <td>{msg.subject}</td>
                            <td>{msg.body}</td>
                            <td>{new Date(msg.createdAt).toLocaleString()}</td>
                            
                            <td>   
                            {/* {msg.attachment ? (
                               <a
                           href={`${msg.attachment}`}
                            target="_blank"
                        rel="noopener noreferrer"
    className="text-blue-600 underline"
  >
    View Attachment
  </a>
) : (
  <p>No Attachment</p>
)} */}

                               {/* {msg.attachment ? (
                              <img 
                              src={msg.attachment} 
                                  alt="attachment" 
                style={{ width: "100px", height: "auto", borderRadius: "6px" }}
               />

                             ) : '—'} */}
                             
                          
  {msg.attachment ? (
    msg.attachment.match(/\.(jpeg|jpg|png|gif)$/i) ? (
      // If it's an image → show download link only
      <a
        href={msg.attachment}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline cursor-pointer"
      >
        Download Image
      </a>
    ) : (
      // If not an image → show download link
      <a
        href={msg.attachment}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline cursor-pointer"
      >
        Download Attachment
      </a>
    )
  ) : (
    <p className="text-gray-500">No Attachment</p>
  )}


  
                            </td>
                            <td className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyingTo(msg);
                                }}
                              >
                                Reply
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(msg._id);
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          )})}
                      </tbody>
                    </table>
                  </div>

                  {/* Reply form */}
                  {replyingTo && (
                    <div className="card mt-3 p-3">
                      <h5>Reply to: {replyingTo.fromEmail}</h5>
                      <p><strong>Subject:</strong> Re: {replyingTo.subject}</p>
                      <form onSubmit={handleReply}>
                        <textarea
                          className="form-control mb-2"
                          rows="4"
                          placeholder="Write your reply..."
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          required
                        ></textarea>
                        <input type="file" className="form-control mb-2" onChange={(e) => setReplyAttachment(e.target.files[0])} /> {/* ✅ File input */}
                        <div className="d-flex gap-2">
                          <button className="btn btn-success" type="submit">Send Reply</button>
                          <button className="btn btn-secondary" type="button" onClick={() => setReplyingTo(null)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Pagination */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <button className="btn btn-outline-primary" onClick={() => setPage(page - 1)} disabled={page === 1}>
                      Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button className="btn btn-outline-primary" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



