// React Query hooks for file tags and analysis.
//
// useFileTags: fetches the tag list for the FilesPanel filter bar.
// useAnalyzeFiles: returns a function that sends a chat message to the
//   agent to trigger vision model analysis. The agent then calls the
//   image_analyze tool (runner-dispatched) to store tags. After the
//   agent responds, the tags query is invalidated to refresh the UI.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFileTags, type TagSummary } from "@/lib/fileTagsApi";
import { useChatStore } from "@/store/chatStore";

/** Query key for file tags. */
const FILE_TAGS_KEY = (conversationId: string) => ["file-tags", conversationId] as const;

/**
 * Fetch all unique tags with counts for a session.
 * Used by the FilesPanel tag-filter bar.
 */
export function useFileTags(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationId ? FILE_TAGS_KEY(conversationId) : ["file-tags", "none"],
    queryFn: () => getFileTags(conversationId!),
    enabled: !!conversationId,
    staleTime: 30_000, // tags don't change often
  });
}

/**
 * Hook that returns a function to trigger agent-driven image analysis.
 * Sends a chat message asking the agent to analyze workspace images.
 * After the agent responds, invalidates the file-tags query to refresh.
 */
export function useAnalyzeFiles() {
  const queryClient = useQueryClient();
  const send = useChatStore((s) => s.send);
  const boundAgentId = useChatStore((s) => s.boundAgentId);

  const analyze = async (conversationId: string) => {
    if (!boundAgentId) {
      throw new Error("useAnalyzeFiles: no agent bound to the current session");
    }
    // Send a message to the agent asking it to analyze images.
    // The agent will use its vision capability + the image_analyze tool.
    await send(
      "请分析工作区中的所有图片文件，用 image_analyze 工具为每张图片生成分类标签。" +
      "Analyze all image files in the workspace and use the image_analyze tool " +
      "to generate classification tags for each image.",
      boundAgentId,
    );
    // Invalidate the tags query after a delay to let the agent finish.
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: FILE_TAGS_KEY(conversationId) });
    }, 5000);
  };

  return { analyze, isPending: false };
}
