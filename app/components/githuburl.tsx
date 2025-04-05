"use client";
import React, { useState } from "react";

interface GithubUrlProps {
  onFetch: (files: string[]) => void;
}

export default function GithubUrl({ onFetch }: GithubUrlProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepoFiles = async () => {
    try {
      const repoPath = url.replace("https://github.com/", "").replace(/\/$/, "");
      const apiUrl = `https://api.github.com/repos/${repoPath}/git/trees/main?recursive=1`;
  
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer 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`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      
  
      const data = await response.json();
  
      if (data && data.tree) {
        const fileNames = data.tree
          .filter((item: any) => item.type === "blob")
          .map((item: any) => item.path);
        onFetch(fileNames);
      } else {
        alert("Failed to fetch files. Make sure the URL is correct.");
      }
    } catch (error) {
      alert("Error fetching files. Please check the URL or try again later.");
    }
  };
  

  return (
    <div className="flex flex-col items-center gap-2 mb-4 w-full">
      <div className="flex w-full">
        <input
          type="text"
          placeholder="Paste your GitHub repository URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchRepoFiles}
          disabled={loading}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400"
        >
          {loading ? "Fetching..." : "Fetch"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
