"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import styles from "./rich-text-editor.module.css";

const COLORS = [
  { label: "Default", value: null },
  { label: "Red", value: "#e53e3e" },
  { label: "Orange", value: "#dd6b20" },
  { label: "Green", value: "#38a169" },
  { label: "Blue", value: "#3182ce" },
  { label: "Purple", value: "#805ad5" },
  { label: "Gray", value: "#718096" },
];

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        heading: false,
        code: false,
        strike: false,
      }),
      TextStyle,
      Color,
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value || "",
    immediatelyRender: false,
    editable: !disabled,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      // Treat empty editor as empty string
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (current !== incoming && incoming !== (current === "<p></p>" ? "" : current)) {
      editor.commands.setContent(incoming || "");
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  function toggleList(type: "bulletList" | "orderedList") {
    const toggleCmd = type === "bulletList"
      ? () => editor!.chain().focus().toggleBulletList().run()
      : () => editor!.chain().focus().toggleOrderedList().run();

    if (editor!.isActive(type)) {
      toggleCmd();
      return;
    }

    // Remove empty paragraphs inside selection before converting to list
    // so blank lines don't become empty list items
    editor!
      .chain()
      .focus()
      .command(({ tr, state, dispatch }) => {
        const { from, to } = state.selection;
        const toDelete: Array<{ pos: number; size: number }> = [];
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === "paragraph" && node.childCount === 0) {
            toDelete.push({ pos, size: node.nodeSize });
          }
        });
        if (dispatch && toDelete.length > 0) {
          toDelete.reverse().forEach(({ pos, size }) => tr.delete(pos, pos + size));
          dispatch(tr);
        }
        return true;
      })
      [type === "bulletList" ? "toggleBulletList" : "toggleOrderedList"]()
      .run();
  }

  const isBold = editor.isActive("bold");
  const isItalic = editor.isActive("italic");
  const isUnderline = editor.isActive("underline");
  const isBulletList = editor.isActive("bulletList");
  const isOrderedList = editor.isActive("orderedList");
  const activeColor = COLORS.find((c) => c.value && editor.isActive("textStyle", { color: c.value }));

  return (
    <div className={`${styles.wrapper}${className ? ` ${className}` : ""}${disabled ? ` ${styles.disabled}` : ""}`}>
      <div className={styles.toolbar}>
        <button
          type="button"
          title="Bold"
          className={`${styles.toolBtn} ${isBold ? styles.toolBtnActive : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          title="Italic"
          className={`${styles.toolBtn} ${isItalic ? styles.toolBtnActive : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
        >
          <em>I</em>
        </button>

        <button
          type="button"
          title="Underline"
          className={`${styles.toolBtn} ${isUnderline ? styles.toolBtnActive : ""}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
        >
          <span className={styles.underlineIcon}>U</span>
        </button>

        <div className={styles.separator} />

        <button
          type="button"
          title="Bullet list"
          className={`${styles.toolBtn} ${isBulletList ? styles.toolBtnActive : ""}`}
          onClick={() => toggleList("bulletList")}
          disabled={disabled}
        >
          <span className={styles.listIcon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="1.5" cy="3.5" r="1.5" fill="currentColor"/>
              <rect x="4" y="3" width="9" height="1" rx="0.5" fill="currentColor"/>
              <circle cx="1.5" cy="7" r="1.5" fill="currentColor"/>
              <rect x="4" y="6.5" width="9" height="1" rx="0.5" fill="currentColor"/>
              <circle cx="1.5" cy="10.5" r="1.5" fill="currentColor"/>
              <rect x="4" y="10" width="9" height="1" rx="0.5" fill="currentColor"/>
            </svg>
          </span>
        </button>

        <button
          type="button"
          title="Ordered list"
          className={`${styles.toolBtn} ${isOrderedList ? styles.toolBtnActive : ""}`}
          onClick={() => toggleList("orderedList")}
          disabled={disabled}
        >
          <span className={styles.listIcon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="4.5" fontSize="4.5" fill="currentColor" fontFamily="monospace">1.</text>
              <rect x="5" y="3" width="8" height="1" rx="0.5" fill="currentColor"/>
              <text x="0" y="8" fontSize="4.5" fill="currentColor" fontFamily="monospace">2.</text>
              <rect x="5" y="6.5" width="8" height="1" rx="0.5" fill="currentColor"/>
              <text x="0" y="11.5" fontSize="4.5" fill="currentColor" fontFamily="monospace">3.</text>
              <rect x="5" y="10" width="8" height="1" rx="0.5" fill="currentColor"/>
            </svg>
          </span>
        </button>

        <div className={styles.separator} />

        <div className={styles.colorRow}>
          {COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              title={c.label}
              disabled={disabled}
              className={`${styles.colorSwatch} ${
                (c.value === null && !activeColor) || activeColor?.value === c.value
                  ? styles.colorSwatchActive
                  : ""
              }`}
              style={c.value ? { background: c.value } : undefined}
              onClick={() => {
                if (c.value === null) {
                  editor.chain().focus().unsetColor().run();
                } else {
                  editor.chain().focus().setColor(c.value).run();
                }
              }}
            />
          ))}
        </div>
      </div>

      <EditorContent
        editor={editor}
        className={styles.editorContent}
      />
    </div>
  );
}
