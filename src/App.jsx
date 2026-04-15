import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"

const API = "http://localhost:8000/api"

function App() {
  const [sessions, setSessions] = useState([])          // 会话列表
  const [currentSession, setCurrentSession] = useState(null)  // 当前会话id
  const [messages, setMessages] = useState([])          // 当前对话消息
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  // 页面加载时获取所有会话
  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    const res = await fetch(`${API}/sessions`)
    const data = await res.json()
    setSessions(data)
  }

  // 点击会话，加载该会话的消息
  const loadSession = async (sessionId) => {
    setCurrentSession(sessionId)
    const res = await fetch(`${API}/sessions/${sessionId}/messages`)
    const data = await res.json()
    setMessages(data)
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: currentSession,
        messages: newMessages
      })
    })
    const data = await res.json()

    // 如果是新会话，更新 session_id 并刷新侧边栏
    if (!currentSession) {
      setCurrentSession(data.session_id)
      fetchSessions()
    }

    setMessages([...newMessages, { role: "assistant", content: data.reply }])
    setLoading(false)
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      
      {/* 侧边栏 */}
      <div style={{ width: 240, borderRight: "1px solid #ddd", padding: 16, overflowY: "auto" }}>
        <button
          onClick={() => { setCurrentSession(null); setMessages([]) }}
          style={{ width: "100%", padding: "8px", marginBottom: 16, borderRadius: 8, cursor: "pointer" }}
        >
          + 新对话
        </button>
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => loadSession(s.id)}
            style={{
              padding: "8px 12px",
              marginBottom: 8,
              borderRadius: 8,
              cursor: "pointer",
              background: currentSession === s.id ? "#e8f0fe" : "transparent"
            }}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* 对话区 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24 }}>
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 12, textAlign: msg.role === "user" ? "right" : "left" }}>
              <span style={{
                background: msg.role === "user" ? "#0084ff" : "#f0f0f0",
                color: msg.role === "user" ? "white" : "black",
                padding: "8px 12px",
                borderRadius: 16,
                display: "inline-block",
                maxWidth: "70%"
              }}>
                {msg.role === "assistant" 
                ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                  : msg.content
                }
              </span>
            </div>
          ))}
          {loading && <div style={{ color: "#999" }}>AI 正在回复...</div>}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="输入消息..."
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc" }}
          />
          <button onClick={sendMessage} style={{ padding: "8px 16px", borderRadius: 8 }}>
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

export default App