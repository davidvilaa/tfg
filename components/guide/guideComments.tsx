"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { MessageCircle } from "lucide-react";
import { useNotification } from "@/components/NotificationProvider";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface GuideCommentsProps {
  guideId: string;
  currentUserId: string | null;
  currentUserProfile: any;
}

const sanitizeSchema = {
  tagNames: ['u', 'br', 'strong', 'em', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'img', 'a', 'code', 'pre', 'blockquote'],
  attributes: {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'title', 'width', 'height']
  }
};

const MAX_REPLY_DEPTH = 5;
const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/0?d=mp&f=y";

export default function GuideComments({ guideId, currentUserId, currentUserProfile }: GuideCommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { showNotification } = useNotification();
  const t = useTranslations("Guide - View");
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, [guideId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("guide_comments")
      .select(`
        id, content, created_at, parent_id,
        profiles:user_id (id, nickname, pfp_url)
      `)
      .eq("guide_id", guideId)
      .order("created_at", { ascending: true }); 

    if (error) {
      console.error(error);
    } else if (data) {
      setComments(data);
    }
  };

  const handlePostComment = async (parentId: string | null = null) => {
    if (!currentUserId) {
      showNotification("Error", "You must be logged in to comment.");
      return;
    }

    const content = parentId ? replyText : newComment;
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("guide_comments")
        .insert({
          guide_id: guideId,
          user_id: currentUserId,
          content: content,
          parent_id: parentId
        })
        .select(`
          id, content, created_at, parent_id,
          profiles:user_id (id, nickname, pfp_url)
        `)
        .single();

      if (error) throw error;
      if (data) {
        setComments([...comments, data]);
        if (parentId) {
          setReplyingTo(null);
          setReplyText("");
        } else {
          setNewComment("");
        }
        showNotification("Success", "Comment posted!");
      }
    } catch (error) {
      console.error(error);
      showNotification("Error", "Could not post your comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildCommentTree = () => {
    const commentMap = new Map();
    const roots: any[] = [];

    comments.forEach(c => commentMap.set(c.id, { ...c, children: [] }));

    comments.forEach(c => {
      if (c.parent_id) {
        const parent = commentMap.get(c.parent_id);
        if (parent) parent.children.push(commentMap.get(c.id));
      } else {
        roots.push(commentMap.get(c.id));
      }
    });

    return roots.reverse();
  };

  const renderCommentThread = (comment: any, depth = 0) => {
    const isReplyingHere = replyingTo === comment.id;

    return (
      <div key={comment.id} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: depth === 0 ? "0" : "15px" }}>
        <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
          
          <img 
            src={comment.profiles?.pfp_url || DEFAULT_AVATAR} 
            alt={comment.profiles?.nickname}
            style={{ width: depth > 0 ? "35px" : "45px", height: depth > 0 ? "35px" : "45px", borderRadius: "4px", objectFit: "cover", backgroundColor: "#e2e8f0", border: "1px solid #cbd5e1" }} 
          />
          
          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px", marginLeft: "2px" }}>
              <span style={{ fontWeight: "bold", color: "#3b82f6", cursor: "pointer" }} onClick={() => router.push(`/profile/${comment.profiles?.nickname}`)}>
                {comment.profiles?.nickname || "Anonymous"}
              </span> 
              <span style={{ margin: "0 5px" }}>•</span> 
              {new Date(comment.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
            </div>
            
            <div className="speech-bubble markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}>
                {comment.content}
              </ReactMarkdown>

              {currentUserId && depth < MAX_REPLY_DEPTH && (
                <div style={{ marginTop: "10px", textAlign: "right" }}>
                   <button 
                      onClick={() => { setReplyingTo(comment.id); setReplyText(""); }}
                      style={{ background: "none", border: "none", color: "#64748b", fontSize: "12px", cursor: "pointer", textDecoration: "underline", padding: 0, minWidth: "auto", boxShadow: "none" }}
                   >
                     {t("btn_reply") || "Reply"}
                   </button>
                </div>
              )}
            </div>

            {isReplyingHere && (
              <div style={{ marginTop: "15px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div className="speech-bubble speech-bubble-input" style={{ flexGrow: 1, padding: "10px", width: "100%" }}>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t("reply_placeholder") || "Escribe tu respuesta..."}
                    style={{ width: "100%", minHeight: "60px", border: "none", outline: "none", resize: "vertical", fontFamily: "inherit", fontSize: "13px", background: "transparent" }}
                    autoFocus
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                    <button onClick={() => setReplyingTo(null)} style={{ padding: "4px 10px", fontSize: "12px" }}>
                      {t("cancel") || "Cancel"}
                    </button>
                    <button 
                      onClick={() => handlePostComment(comment.id)} 
                      disabled={isSubmitting || !replyText.trim()}
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                    >
                      {isSubmitting ? "..." : (t("btn_reply") || "Reply")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {comment.children && comment.children.length > 0 && (
              <div style={{ marginLeft: "30px", borderLeft: "2px solid #e2e8f0", paddingLeft: "15px", marginTop: "10px" }}>
                {comment.children.map((child: any) => renderCommentThread(child, depth + 1))}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  const commentRoots = buildCommentTree();

  return (
    <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`
        .speech-bubble {
          position: relative;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 15px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .speech-bubble::before, .speech-bubble::after {
          content: '';
          position: absolute;
          border-style: solid;
          display: block;
          width: 0;
        }
        .speech-bubble::before {
          top: 15px; left: -9px; border-width: 8px 9px 8px 0; border-color: transparent #cbd5e1 transparent transparent;
        }
        .speech-bubble::after {
          top: 16px; left: -7px; border-width: 7px 8px 7px 0; border-color: transparent #f8fafc transparent transparent;
        }
        .speech-bubble-input {
          background: #ffffff; border-color: #9ca3af; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
        }
        .speech-bubble-input::before { border-color: transparent #9ca3af transparent transparent; }
        .speech-bubble-input::after { border-color: transparent #ffffff transparent transparent; }
        .markdown-content p { margin-top: 0; margin-bottom: 0.5em; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content a { color: #2563eb; text-decoration: none; }
        .markdown-content a:hover { text-decoration: underline; }
        .markdown-content img { max-width: 100%; border-radius: 4px; margin: 10px 0; }
        .markdown-content blockquote { border-left: 3px solid #cbd5e1; margin: 0; padding-left: 10px; color: #64748b; font-style: italic; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        <MessageCircle size={20} color="#334155" />
        <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, color: "#334155" }}>
          {t("comments_title") || "Comments"} ({comments.length})
        </h3>
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "flex-start", marginTop: "10px" }}>
        <img 
          src={currentUserProfile?.pfp_url || DEFAULT_AVATAR} 
          alt="Tu avatar" 
          style={{ width: "45px", height: "45px", borderRadius: "4px", objectFit: "cover", backgroundColor: "#e2e8f0", border: "1px solid #cbd5e1" }} 
        />
        <div className="speech-bubble speech-bubble-input" style={{ flexGrow: 1, padding: "10px 15px" }}>
          {currentUserId ? (
            <>
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("write_placeholder") || "Escribe tu comentario..."}
                style={{ 
                  width: "100%", minHeight: "80px", border: "none", outline: "none", resize: "vertical", 
                  fontFamily: "inherit", fontSize: "14px", background: "transparent", color: "#0f172a" 
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", borderTop: "1px dashed #e2e8f0", paddingTop: "10px" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Markdown allowed</span>
                <button 
                  onClick={() => handlePostComment(null)} 
                  disabled={isSubmitting || !newComment.trim()}
                  style={{ padding: "4px 16px", minWidth: "80px" }}
                >
                  {isSubmitting ? "..." : (t("btn_post_comment") || "Post")}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", height: "80px", justifyContent: "center", color: "#64748b" }}>
              <p>{t("login_to_comment") || "Log in to join the conversation."}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "25px", marginTop: "10px" }}>
        {commentRoots.map((comment) => renderCommentThread(comment, 0))}

        {commentRoots.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8", fontStyle: "italic" }}>
            {t("no_comments_yet") || "No comments yet. Be the first to share your thoughts!"}
          </div>
        )}
      </div>
    </div>
  );
}