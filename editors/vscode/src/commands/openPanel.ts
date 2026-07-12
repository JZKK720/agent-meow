/**
 * "agent-meow: Open" command.
 *
 * The agent-meow UI renders only in the editor-beside `WebviewPanel`, owned by the
 * shared `EditorPanelController`. `agent_meow.open` simply ensures that panel is
 * open and revealed; the controller owns the singleton and the resolved local
 * server target.
 */
import * as vscode from "vscode";
import type { EditorPanelController } from "../panel/EditorPanelController";

export const OPEN_PANEL_COMMAND = "agent_meow.open";

/** Register the `agent_meow.open` command. Returns the disposable command. */
export function registerOpenPanel(
  context: vscode.ExtensionContext,
  controller: EditorPanelController,
): vscode.Disposable {
  const cmd = vscode.commands.registerCommand(OPEN_PANEL_COMMAND, () => {
    controller.ensure();
  });

  context.subscriptions.push(cmd);
  return cmd;
}
