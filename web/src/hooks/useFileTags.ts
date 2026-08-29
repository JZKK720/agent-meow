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
    // Chinese-only message: the agent defaults to the user's language,
    // and a mixed-language message causes mixed-language replies.
    // Batch instruction: loading 33+ images at once exceeds the 1M
    // context window. The agent processes 5 images per batch.
    await send(
      "请分析工作区中的所有图片文件，用 image_analyze 工具为每张图片生成分类标签。" +
      "注意：每次只读取5张图片进行分析，不要一次性加载所有图片。" +
      "分析完一批后继续下一批，直到所有图片都处理完成。",
      boundAgentId,
    );
    // Invalidate the tags query after a delay to let the agent finish.
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: FILE_TAGS_KEY(conversationId) });
    }, 5000);
  };

  return { analyze, isPending: false };
}
