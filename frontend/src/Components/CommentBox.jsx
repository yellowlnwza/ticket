import React, { useState, useRef } from "react";
import { postComment } from "../services/api";

export default function CommentBox({ ticketId, onNewComment }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setLoading(true);
    setError(null);
    try {
      const newComment = await postComment(ticketId, trimmedText);
      setText("");
      onNewComment && onNewComment(newComment);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโพสต์ความเห็นได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  function tryFocus(e) {
    // log the element under the cursor to help debug overlays
    try {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      console.log('elementFromPoint at click:', el, el && el.outerHTML ? el.outerHTML.slice(0,200) : 'n/a');
    } catch (err) {
      console.warn('elementFromPoint failed', err);
    }
    // try to programmatically focus the textarea
    if (textareaRef.current) textareaRef.current.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label className="block text-sm font-medium">Comment</label>
      <div onMouseDown={tryFocus}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { console.log('CommentBox onChange', e.target.value); setText(e.target.value); }}
          onKeyDown={(e) => console.log('CommentBox onKeyDown', e.key)}
          placeholder="เขียนความเห็นของคุณ..."
          className="mt-1 block w-full p-2 border rounded"
          rows={3}
          aria-label="Comment"
          autoFocus
          style={{ pointerEvents: 'auto', zIndex: 50 }}
        ></textarea>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <div className="mt-2 text-right">
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          {loading ? "Posting..." : "ส่ง"}
        </button>
      </div>
    </form>
  );
}
