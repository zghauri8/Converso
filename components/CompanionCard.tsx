"use client";

import { removeBookmark, addBookmark } from "@/lib/actions/companion.action";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked?: boolean; // Make it optional with default
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked = false, // Default to false
}: CompanionCardProps) => {
  const pathname = usePathname();
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    // Prevent the click from bubbling up to parent elements
    e.preventDefault();
    e.stopPropagation();
    
    console.log("🖱️ Bookmark clicked for companion:", id);
    console.log("📍 Current bookmark state:", isBookmarked);
    
    setIsLoading(true);
    
    try {
      if (isBookmarked) {
        console.log("➖ Removing bookmark...");
        await removeBookmark(id, pathname);
        setIsBookmarked(false);
        console.log("✅ Bookmark removed successfully");
      } else {
        console.log("➕ Adding bookmark...");
        await addBookmark(id, pathname);
        setIsBookmarked(true);
        console.log("✅ Bookmark added successfully");
      }
    } catch (error: any) {
      console.error("❌ Bookmark operation failed:", error);
      
      // Show error to user
      alert(`Error: ${error.message || "Something went wrong"}`);
      
      // Revert the state if there was an error
      // (the state will remain unchanged since we only update on success)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="companion-card" style={{ backgroundColor: color }}>
      <div className="flex justify-between items-center">
        <div className="subject-badge">{subject}</div>
        <button 
          className={`companion-bookmark ${isLoading ? 'opacity-50' : ''}`}
          onClick={handleBookmark}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Image
              src={
                isBookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"
              }
              alt="bookmark"
              width={12.5}
              height={15}
            />
          )}
        </button>
      </div>

      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>
      <div className="flex items-center gap-2">
        <Image
          src="/icons/clock.svg"
          alt="duration"
          width={13.5}
          height={13.5}
        />
        <p className="text-sm">{duration} minutes</p>
      </div>

      <Link href={`/companions/${id}`} className="w-full">
        <button className="btn-primary w-full justify-center">
          Launch Lesson
        </button>
      </Link>
    </article>
  );
};

export default CompanionCard;