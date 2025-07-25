

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const fetchMessages = useCallback(async () => {
    if (tab === 'compose') return;

    setLoading(true);

    let url = '';
    if (tab === 'inbox') url = `/inbox?page=${page}&limit=${limit}`;
    if (tab === 'sent') url = `/sent`;
    if (tab === 'trash') url = `/trash`;

    const res = await axios.get(`http://localhost:3000/api/messages${url}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setMessages(res.data.messages);
    if (tab === 'inbox') setTotal(res.data.total);

    setLoading(false);
  }, [tab, page]);

  useEffect(() => {
    fetchMessages();
  }, [tab, page, fetchMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    await axios.post(
      'http://localhost:3000/api/messages/send',
      { toEmail, subject, body },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    alert('Message sent!');
    setToEmail('');
    setSubject('');
    setBody('');
    setTab('sent');
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/api/messages/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchMessages();
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return; // already read, do nothing

    await axios.patch(`http://localhost:3000/api/messages/read/${id}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    fetchMessages();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="d-flex flex-column vh-100 ">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4 ">
        <span className="navbar-brand">📬 Email Client</span>
        <div className="ms-auto d-flex gap-3">
          <span className="text-white">Hi, {user.username}</span>
          <button className="btn btn-outline-light" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid flex-grow-1 d-flex p-0">
        <div className="bg-light border-end p-3" style={{ width: '200px' }}>
          <button
            className={`btn w-100 mb-2 ${
              tab === 'inbox' ? 'btn-primary' : 'btn-outline-primary'
            }`}
            onClick={() => {
              setTab('inbox');
              setPage(1);
            }}
          >
            Inbox
          </button>
          <button
            className={`btn w-100 mb-2 ${
              tab === 'sent' ? 'btn-secondary' : 'btn-outline-secondary'
            }`}
            onClick={() => setTab('sent')}
          >
            Sent
          </button>
          <button
            className={`btn w-100 mb-2 ${
              tab === 'trash' ? 'btn-danger' : 'btn-outline-danger'
            }`}
            onClick={() => setTab('trash')}
          >
            Trash
          </button>
          <button
            className={`btn w-100 mb-2 ${
              tab === 'compose' ? 'btn-success' : 'btn-outline-success'
            }`}
            onClick={() => setTab('compose')}
          >
            Compose
          </button>
        </div>

        <div className="flex-grow-1 p-4 overflow-auto">
          {tab === 'compose' && (
            <div className="card shadow p-4">
              <h4>Compose</h4>
              <form onSubmit={handleSend}>
                <input
                  className="form-control mb-2"
                  placeholder="To Email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  required
                />
                <input
                  className="form-control mb-2"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <textarea
                  className="form-control mb-2"
                  placeholder="Body"
                  rows="5"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                ></textarea>
                <button className="btn btn-success">Send</button>
              </form>
            </div>
          )}

          {tab !== 'compose' && (
            <div className="card shadow p-4">
              <h4>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h4>
              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p>Loading...</p>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-muted">No messages found.</p>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>From</th>
                          <th>To</th>
                          <th>Subject</th>
                          <th>Body</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messages.map((msg) => (
                          <tr
                            key={msg._id}
                            className={`cursor-pointer ${
                              !msg.read ? 'table-primary fw-bold' : ''
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleMarkAsRead(msg._id, msg.read)}
                          >
                            <td>{msg.fromEmail || '-'}</td>
                            <td>{msg.toEmail || '-'}</td>
                            <td>{msg.subject}</td>
                            <td>{msg.body}</td>
                            <td>{new Date(msg.createdAt).toLocaleString()}</td>
                            <td>
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
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {tab === 'inbox' && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </button>
                      <span>
                        Page {page} of {totalPages}
                      </span>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
