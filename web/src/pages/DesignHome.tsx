/**
 * MEOW Agent — Figma home/empty state reproduction.
 * Source: figma.com/design/9YHWJe8FcdTSdcM8dUAQpK node 0:2
 * Standalone review page; not yet routed. All assets local in ./figma-assets/.
 *
 * Design read: consumer AI chat home, playful 橘宝 brand, exact Figma match.
 * Ponytail: baked PNGs (waveform, greeting mascot) used as-is — no reconstruction.
 */
import { useState } from "react";

import catArtwork from "./figma-assets/cat-artwork.png";
import greetingMascot from "./figma-assets/greeting-emoji.png";
import waveform from "./figma-assets/waveform.png";
import iconImageGen from "./figma-assets/icon-image-gen.png";
import iconVideoGen from "./figma-assets/icon-video-gen.png";
import iconDocGen from "./figma-assets/icon-doc-gen.png";
import iconAddContext from "./figma-assets/icon-context-chip.png";
import iconChipDot from "./figma-assets/icon-chip-dot.png";
import iconSend from "./figma-assets/icon-send-arrow.png";
import iconNewChat from "./figma-assets/icon-new-chat.png";
import iconSearch from "./figma-assets/icon-search.png";
import iconSettings from "./figma-assets/icon-settings.png";
import iconClose from "./figma-assets/icon-close.png";
import dividerLine from "./figma-assets/divider-line.png";

const HISTORY = [
  "如何使用睡大觉颠三倒看Markdown...",
  "帮我写一份上周颠三倒周五工作周报...",
  "PPT排版设计技颠三倒巧如何才能提...",
  "人工智能发展趋颠三倒势该如何去控...",
  "数据分析方法汇总颠三倒如下方数据...",
];

const CHIPS = [
  { label: "暂无主机", active: false },
  { label: "工作目录", active: false },
  { label: "无工作区", active: false },
  { label: "Harness", active: true },
] as const;

const CARDS = [
  {
    title: "图片生成",
    desc: "照片编辑、图像生成与画布式视觉工作流",
    icon: iconImageGen,
    border: "#e9c4ff",
    shadow: "rgba(130,53,185,0.09)",
    gradient: "linear-gradient(to bottom, rgba(242,220,255,0.2), rgba(217,151,255,0.2))",
    inset: "inset 0px -2px 1px 0px rgba(200,151,255,0.4)",
  },
  {
    title: "视频生成",
    desc: "视频生成、片段管理与播放器工作流",
    icon: iconVideoGen,
    border: "#c4dcff",
    shadow: "rgba(53,106,185,0.09)",
    gradient: "linear-gradient(to bottom, rgba(220,234,255,0.2), rgba(151,193,255,0.2))",
    inset: "inset 0px -2px 1px 0px rgba(151,193,255,0.4)",
  },
  {
    title: "文档生成",
    desc: "面向规范、文档、笔记与结构化写作的工作流",
    icon: iconDocGen,
    border: "#ffc4c4",
    shadow: "rgba(209,78,78,0.09)",
    gradient: "linear-gradient(to bottom, rgba(255,220,220,0.2), rgba(255,151,151,0.2))",
    inset: "inset 0px -2px 1px 0px rgba(255,151,151,0.4)",
  },
] as const;

export function DesignHome() {
  const [draft, setDraft] = useState("");
  const [activeChips, setActiveChips] = useState<Set<string>>(
    new Set(CHIPS.filter((c) => c.active).map((c) => c.label)),
  );

  const toggleChip = (label: string) =>
    setActiveChips((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-white font-sans text-[#322f2c]">
      {/* ---------- Sidebar (314px) ---------- */}
      <aside className="relative z-20 flex h-full w-[314px] shrink-0 flex-col bg-white/80 backdrop-blur-[2.5px] shadow-[0px_4px_40px_0px_rgba(30,18,0,0.15)]">
        {/* Brand + close/settings */}
        <div className="flex items-center justify-between px-[30px] pt-[32px]">
          <span className="text-[18px] font-medium leading-[18px] text-[#2c2e32]">MEOW Agent</span>
          <img src={iconClose} alt="" className="size-[16px]" aria-hidden />
        </div>

        {/* New chat */}
        <button
          type="button"
          className="mx-[31px] mt-[42px] flex h-[44px] w-[250px] items-center gap-[8px] rounded-[8px] bg-[rgba(252,227,184,0.4)] px-[12px] text-left text-[16px] font-medium text-[#f36f4f] transition-colors hover:bg-[rgba(252,227,184,0.6)]"
        >
          <img src={iconNewChat} alt="" className="size-[20px]" />
          新建对话
        </button>

        {/* Search */}
        <div className="mx-[31px] mt-[24px] flex h-[44px] w-[218px] items-center gap-[8px] rounded-[8px] border border-[#c3c4c7] px-[12px]">
          <img src={iconSearch} alt="" className="size-[20px]" aria-hidden />
          <input
            type="text"
            placeholder="搜索对话..."
            className="w-full bg-transparent text-[16px] text-[#4c4d57] placeholder:text-[#c3c4c7] focus:outline-none"
          />
        </div>

        {/* Divider */}
        <img src={dividerLine} alt="" className="mx-[31px] my-[24px] block h-px w-[250px]" />

        {/* History label */}
        <span className="px-[30px] text-[13px] text-[#86878d]">记录</span>

        {/* History list */}
        <nav className="mt-[14px] flex-1 space-y-[10px] overflow-y-auto px-[31px]">
          {HISTORY.map((row, i) => (
            <button
              key={i}
              type="button"
              className="flex w-[256px] items-center gap-[8px] truncate rounded-[6px] px-[8px] py-[6px] text-left text-[14px] text-[#4c4d57] transition-colors hover:bg-[#f5f3f0]"
            >
              <span className="truncate">{row}</span>
            </button>
          ))}
        </nav>

        {/* Bottom divider + settings */}
        <img src={dividerLine} alt="" className="mx-[31px] mb-[25px] block h-px w-[250px]" />
        <button
          type="button"
          className="absolute bottom-[26px] left-[45px] flex items-center gap-[10px] text-[14px] text-[#4c536a]"
        >
          <img src={iconSettings} alt="" className="size-[24px]" />
          设置
        </button>
      </aside>

      {/* ---------- Main canvas ---------- */}
      <main className="relative flex-1 overflow-hidden">
        {/* Decorative cat artwork — two copies, 30% opacity, behind content */}
        <img
          src={catArtwork}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-[24px] -top-[146px] h-[1179px] w-[706px] opacity-30"
        />
        <img
          src={catArtwork}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-[722px] -top-[92px] h-[1179px] w-[706px] opacity-30"
        />

        {/* Greeting — mascot + headline */}
        <div className="absolute right-[355px] top-[118px] flex h-[124px] w-[417px] items-center gap-[39px]">
          <img src={greetingMascot} alt="" className="h-[124px] w-[78px] object-cover" />
          <span className="whitespace-nowrap text-[32px] font-semibold leading-[36px] text-[#322f2c]">
            喊一声，橘宝橘宝！
          </span>
        </div>

        {/* Waveform — baked composite image (bars + paw) */}
        <img
          src={waveform}
          alt=""
          aria-hidden
          className="absolute right-[284px] top-[322px] h-[96px] w-[560px]"
        />

        {/* ---------- Upper panel: context chips only ---------- */}
        <ContextPanel top={290} chips={CHIPS} activeChips={activeChips} onToggleChip={toggleChip} />

        {/* ---------- Lower panel: text input + send + chips ---------- */}
        <InputPanel
          top={522}
          chips={CHIPS}
          activeChips={activeChips}
          onToggleChip={toggleChip}
          draft={draft}
          setDraft={setDraft}
        />

        {/* ---------- Capability cards ---------- */}
        <div className="absolute left-[353px] top-[754px] flex gap-[24px]">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="relative flex h-[118px] w-[333px] items-center gap-[24px] rounded-[24px] border px-[24px] transition-transform hover:scale-[1.02]"
              style={{
                borderColor: card.border,
                boxShadow: `0px 11.39px 22.34px 0px ${card.shadow}`,
                background: card.gradient,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-[24px]"
                style={{ boxShadow: card.inset }}
              />
              <img src={card.icon} alt="" className="size-[40px] shrink-0" />
              <div className="relative z-10">
                <p className="text-[18px] font-medium leading-[18px] text-[#4c4d57]">{card.title}</p>
                <p className="mt-[8px] text-[14px] leading-[22px] text-[#4c4d57]">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/** Upper panel — shows added context chips with a "+" add-context button. No text input. */
function ContextPanel({
  top,
  chips,
  activeChips,
  onToggleChip,
}: {
  top: number;
  chips: readonly { label: string; active: boolean }[];
  activeChips: Set<string>;
  onToggleChip: (label: string) => void;
}) {
  return (
    <div
      className="absolute left-[353px] flex h-[200px] w-[1047px] flex-col justify-end rounded-[24px] border border-[#cbd4db] bg-[#f9f7f5]"
      style={{ top }}
    >
      <div className="flex items-center gap-[24px] px-[16px] pb-[14px]">
        <button type="button" className="flex size-[32px] items-center justify-center shrink-0">
          <img src={iconAddContext} alt="添加上下文" className="size-[32px]" />
        </button>
        {chips.map((chip) => {
          const active = activeChips.has(chip.label);
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => onToggleChip(chip.label)}
              className="flex items-center gap-[6px] whitespace-nowrap text-[14px] transition-colors"
              style={{ color: active ? "#322f2c" : "#86878d" }}
            >
              <img src={iconChipDot} alt="" className="size-[12px]" />
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Lower panel — text input with placeholder + send button + context chips. */
function InputPanel({
  top,
  chips,
  activeChips,
  onToggleChip,
  draft,
  setDraft,
}: {
  top: number;
  chips: readonly { label: string; active: boolean }[];
  activeChips: Set<string>;
  onToggleChip: (label: string) => void;
  draft: string;
  setDraft: (v: string) => void;
}) {
  return (
    <div
      className="absolute left-[353px] flex h-[200px] w-[1047px] flex-col rounded-[24px] border border-[#cbd4db] bg-[#f9f7f5]"
      style={{ top }}
    >
      <div className="flex items-center gap-[12px] p-[16px]">
        <button type="button" className="flex size-[32px] items-center justify-center shrink-0">
          <img src={iconAddContext} alt="添加上下文" className="size-[32px]" />
        </button>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="请输入文字..."
          className="flex-1 bg-transparent text-[14px] font-light text-[#322f2c] placeholder:text-[#86878d] focus:outline-none"
        />
        <button
          type="button"
          className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[#f36f4f] transition-colors hover:bg-[#e85a3a]"
        >
          <img src={iconSend} alt="发送" className="size-[16px]" />
        </button>
      </div>
      <div className="mt-auto flex items-center gap-[24px] px-[16px] pb-[14px]">
        {chips.map((chip) => {
          const active = activeChips.has(chip.label);
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => onToggleChip(chip.label)}
              className="flex items-center gap-[6px] whitespace-nowrap text-[14px] transition-colors"
              style={{ color: active ? "#322f2c" : "#86878d" }}
            >
              <img src={iconChipDot} alt="" className="size-[12px]" />
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DesignHome;