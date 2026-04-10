import { useState } from "react"

function App() {
  const [messages, setMessages] = useState([]) // 对话历史
  const [input, setInput] = useState("")        // 输入框内容
  const [loading, setLoading] = useState(false) // 等待AI回复中

  const sendMessage = async () => {
    if (!input.trim()) return  // 空消息不发送

    // 把用户消息加入历史
    const newMessages = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    // 调用后端
    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages })
    })
    const data = await response.json()

    // 把AI回复加入历史
    setMessages([...newMessages, { role: "assistant", content: data.reply }])
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
      <h2>AI Chat</h2>

      {/* 消息列表 */}
      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, minHeight: 300, marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 12, textAlign: msg.role === "user" ? "right" : "left" }}>
            <span style={{
              background: msg.role === "user" ? "#0084ff" : "#f0f0f0",
              color: msg.role === "user" ? "white" : "black",
              padding: "8px 12px",
              borderRadius: 16,
              display: "inline-block",
              maxWidth: "80%"
            }}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <div style={{ color: "#999" }}>AI 正在回复...</div>}
      </div>

      {/* 输入框 */}
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
  )
}

export default App