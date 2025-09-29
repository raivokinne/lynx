import { useState } from "react";
import {
  X,
  Upload,
  Terminal,
  FolderGit2,
  User,
  Mail,
  Loader2,
  Link2,
  Key,
} from "lucide-react";
import { getAuthToken } from "../utils/utils";

interface GitPanelProps {
  open: boolean;
  close: () => void;
}

export const GitPanel = (props: GitPanelProps) => {
  const [repoName, setRepoName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!props.open) return null;

  const handleCommitAndPush = async () => {
    setError("");
    setSuccess("");

    if (!repoName.trim()) {
      setError("Repository name is required");
      return;
    }
    if (!commitMessage.trim()) {
      setError("Commit message is required");
      return;
    }
    if (!authorName.trim() || !authorEmail.trim()) {
      setError("Author name and email are required");
      return;
    }

    setIsLoading(true);

    const token = getAuthToken();

    try {
      if (remoteUrl.trim()) {
        try {
          await fetch("http://localhost:3001/api/git/setremote", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              dir: repoName,
              url: remoteUrl,
            }),
          });
        } catch (err) {
          console.log("Remote setup:", err);
        }
      }

      const commitResponse = await fetch(
        "http://localhost:3001/api/git/commit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dir: repoName,
            name: authorName,
            email: authorEmail,
            message: commitMessage,
          }),
        },
      );

      if (!commitResponse.ok) {
        const errorData = await commitResponse.text();
        throw new Error(errorData || "Commit failed");
      }

      const commitData = await commitResponse.json();
      console.log("Commit SHA:", commitData.commit);

      const pushResponse = await fetch("http://localhost:3001/api/git/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dir: repoName,
          token: token || undefined,
        }),
      });

      if (!pushResponse.ok) {
        const errorData = await pushResponse.text();
        throw new Error(errorData || "Push failed");
      }

      const pushData = await pushResponse.json();
      setSuccess(
        pushData.message || "Successfully committed and pushed changes!",
      );

      setTimeout(() => {
        setCommitMessage("");
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
        <div className="p-5 relative">
          <button
            onClick={props.close}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">Git Manager</h1>
              <p className="text-white/70 text-sm">
                Version control operations
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-blue-400" />
              Repository Name
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="my-awesome-project"
              className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-yellow-400" />
              Remote URL (optional)
            </label>
            <input
              type="text"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://github.com/username/repo.git"
              className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-yellow-400" />
              Access Token (optional)
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User className="w-4 h-4 text-green-400" />
              Author Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-400" />
              Author Email
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              Commit Message
            </label>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe your changes..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleCommitAndPush}
            disabled={isLoading}
            className="w-full border border-white text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Commit & Push Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
