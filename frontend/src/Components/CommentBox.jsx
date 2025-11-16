import React, { useState, useRef } from "react";
import { postComment } from "../services/api";

export default function CommentBox({ ticketId, onNewComment }) {
  const [text, setText] = useState(""); // State: เก็บข้อความที่ผู้ใช้พิมพ์ในช่อง comment (ค่าเริ่มต้นคือ "" หรือว่างเปล่า)
  const [loading, setLoading] = useState(false); // State: เก็บสถานะการโหลด (true = กำลังส่งข้อมูล, false = อยู่ในสถานะปกติ) ใช้สำหรับแสดง/ซ่อน loading spinner หรือ disable ปุ่ม
  const [error, setError] = useState(null); // State: เก็บข้อความ error หากการส่งข้อมูลล้มเหลว (ค่าเริ่มต้นคือ null) ใช้สำหรับแสดงข้อความแจ้งเตือนผู้ใช้
  const textareaRef = useRef(null); // Ref: สำหรับอ้างอิงไปยัง DOM element ของ <textarea> โดยตรง เช่น ใช้สำหรับสั่ง .focus()

  // ฟังก์ชันนี้จะถูกเรียกเมื่อผู้ใช้กดส่ง (submit) ฟอร์ม
  async function handleSubmit(e) {
    e.preventDefault(); // ป้องกันไม่ให้ browser refresh หน้าเว็บ (ซึ่งเป็นพฤติกรรมปกติของ form)
    const trimmedText = text.trim(); // ตัดช่องว่าง (whitespace) ที่อยู่หน้าและหลังข้อความออก
    if (!trimmedText) return;

    setLoading(true); // ตั้งสถานะเป็น "กำลังโหลด"
    setError(null); // ล้างค่า error เก่า (ถ้ามี) ออกจากหน้าจอ
    try { // ใช้ try...catch...finally เพื่อจัดการ Asynchronous Operation
      const newComment = await postComment(ticketId, trimmedText); // 5a. เรียกฟังก์ชัน (async) 'postComment' (ที่สมมติว่า import มา) เพื่อส่งข้อมูล `ticketId` และ `trimmedText` ไปยัง Server/API
      setText("");
      onNewComment && onNewComment(newComment); // (สำเร็จ) เรียก callback 'onNewComment' (ถ้า parent component ส่งมาให้) พร้อมกับส่งข้อมูล comment ใหม่ที่ได้จาก API กลับไปให้ parent เพื่ออัปเดต UI (เช่น เพิ่ม comment ใหม่ลงในรายการทันที)
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโพสต์ความเห็นได้ กรุณาลองใหม่");
    } finally { // (ทำงานเสมอ) ไม่ว่า 'try' จะสำเร็จ หรือ 'catch' จะทำงาน
      setLoading(false); // ต้องตั้งค่าสถานะ "กำลังโหลด" กลับเป็น false
    }
  }

  function tryFocus(e) {  // ฟังก์ชันนี้พยายามสั่ง focus ไปที่ textarea ที่เราต้องการ
    // บันทึก log ของ element ที่อยู่ใต้เคอร์เซอร์เมาส์ ณ จุดที่คลิก
    try {
      const el = document.elementFromPoint(e.clientX, e.clientY); // ดึง element ที่อยู่บนสุดจากพิกัด (x, y) ของเมาส์
      console.log('elementFromPoint at click:', el, el && el.outerHTML ? el.outerHTML.slice(0,200) : 'n/a'); // แสดงข้อมูล element นั้นใน console (พร้อม HTML 200 ตัวอักษรแรก)
    } catch (err) {
      console.warn('elementFromPoint failed', err); // แสดงคำเตือนใน console หาก `elementFromPoint` ทำงานล้มเหลว
    }
    // ถ้า textareaRef.current (คือ DOM element ของ textarea) มีอยู่จริง ให้สั่ง .focus() เพื่อให้เคอร์เซอร์ไปกระพริบที่ช่องนั้น
    if (textareaRef.current) textareaRef.current.focus();
  }
  
  // ส่งคืน (render) element ที่เป็น JSX เพื่อแสดงผลบนหน้าจอ
  return (
    // เมื่อฟอร์มถูก "submit" (เช่น กด Enter หรือคลิกปุ่ม submit) ให้เรียกใช้ฟังก์ชัน `handleSubmit` ที่เราคอมเมนต์ไว้ในชุดที่ 2
    <form onSubmit={handleSubmit} className="mt-4">
      {/* Label สำหรับช่อง textarea (เพื่อ Accessibility) */}
      <label className="block text-sm font-medium">Comment</label>
      {/* * นี่คือส่วนสำคัญที่เชื่อมกับฟังก์ชัน `tryFocus` (จากชุดที่ 1)
          * เราใช้ `onMouseDown` (เมื่อเมาส์ถูกกดลง) บน div ที่ครอบ textarea
          * เพื่อว่า... แม้ผู้ใช้จะคลิก "พลาด" ไปโดนพื้นที่รอบๆ textarea
          * ฟังก์ชัน `tryFocus` ก็จะทำงาน และสั่ง `focus()` กลับไปที่ textarea
          * ช่วยแก้ปัญหา overlay หรือการหลุด focus โดยไม่ตั้งใจ 
        */}
      <div onMouseDown={tryFocus}>
        <textarea
          // เชื่อม ref (จากชุดที่ 2) เข้ากับ DOM element นี้ เพื่อให้ `tryFocus` (ที่ใช้ `textareaRef.current.focus()`) ทำงานได้
          ref={textareaRef}
          // "Controlled Component": ผูกค่าในช่องนี้กับ `text` state (จากชุดที่ 2)
          value={text}
          onChange={(e) => { console.log('CommentBox onChange', e.target.value); setText(e.target.value); }} // "Controlled Component": เมื่อผู้ใช้พิมพ์ (onChange) ให้อัปเดต `text` state (ผ่าน `setText`) (มี console.log สำหรับช่วย debug)
          onKeyDown={(e) => console.log('CommentBox onKeyDown', e.key)}  // (มี console.log สำหรับช่วย debug การกดปุ่ม)
          placeholder="เขียนความเห็นของคุณ..."
          className="mt-1 block w-full p-2 border rounded"
          rows={3}
          aria-label="Comment"
          autoFocus // ให้เมาส์ focus ที่ช่องนี้อัตโนมัติเมื่อโหลดเสร็จ
          style={{ pointerEvents: 'auto', zIndex: 50 }} // `zIndex: 50`: ช่วยจัดลำดับให้ textarea นี้ "อยู่บน" element อื่น และ `pointerEvents: 'auto'`: ยืนยันว่า element นี้สามารถคลิกได้ (สัมพันธ์กับ `tryFocus`)
        ></textarea>
      </div>

      {/* * Conditional Rendering:
      * ถ้า `error` state (จากชุดที่ 2) มีค่า (ไม่ใช่ null)
      * ให้แสดง <p> ที่มีข้อความ error นั้น (เช่น "ไม่สามารถโพสต์ความเห็นได้...") */} 
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}  
      <div className="mt-2 text-right">
        <button
          type="submit"
          disabled={loading} // ถ้า `loading` state (จากชุดที่ 2) เป็น true......ให้ "ปิดการใช้งาน" (disable) ปุ่มนี้ (ป้องกันการกดซ้ำ)
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          {loading ? "Posting..." : "ส่ง"} 
          {/* * 5b. Conditional Rendering (แสดงข้อความบนปุ่ม):
          * ถ้า `loading` เป็น true, แสดง "Posting..."
          * ถ้า `loading` เป็น false, แสดง "ส่ง" */}
        </button>
      </div>
    </form>
  );
}
