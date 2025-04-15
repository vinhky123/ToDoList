import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import "../styles/note.css";

const NotePages = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Gõ note của mày ở đây..." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "editor-content",
      },
    },
  });

  const handleSaveNote = () => {
    if (editor) {
      const content = editor.getHTML();
      console.log("Saving note:", content);
    }
  };

  // Bắt sự kiện Ctrl+S
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault(); // Ngăn hành vi mặc định của trình duyệt
        handleSaveNote();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="editor-container">
      {/* Bubble Menu - Menu nổi khi chọn text */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 200 }}
        className="bubble-menu"
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold") ? "menu-button active" : "menu-button"
          }
        >
          <b>B</b>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic") ? "menu-button active" : "menu-button"
          }
        >
          <i>I</i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive("bulletList") ? "menu-button active" : "menu-button"
          }
        >
          •
        </button>
      </BubbleMenu>

      {/* Nội dung editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default NotePages;
