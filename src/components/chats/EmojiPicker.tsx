"use client";

import React, { useMemo, useState } from "react";
import { Box, InputBase, Tooltip, Typography } from "@mui/material";
import { motion } from "framer-motion";
import {
    MdAccessTime, MdOutlineEmojiEmotions, MdOutlinePets, MdOutlineFastfood,
    MdOutlineDirectionsCar, MdOutlineLightbulb, MdOutlineEmojiSymbols, MdSearch,
} from "react-icons/md";
import { C, scrollbarSx } from "./theme";

const GROUPS: { key: string; icon: React.ReactNode; label: string; emojis: string[] }[] = [
    {
        key: "smileys", label: "Smileys & People", icon: <MdOutlineEmojiEmotions size={16} />,
        emojis: "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😋 😛 🤪 🤨 🧐 🤓 😎 🥳 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤯 😳 🥵 🥶 😱 😨 😰 😥 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😴 🤤 😪 😮‍💨 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 😈 👿 👻 💀 👽 🤖 🎃 🙌 👏 👍 👎 👊 ✊ 🤛 🤜 🤞 ✌️ 🤟 🤘 👌 🤌 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤙 💪 🙏 ✍️ 💅 👀 🧠 👶 🧑 👨 👩 🧓 👮 🕵️ 💂 👷 🤵 👰 🦸 🦹 🧑‍💻 👨‍💻 👩‍💻".split(" "),
    },
    {
        key: "nature", label: "Animals & Nature", icon: <MdOutlinePets size={16} />,
        emojis: "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🦂 🐢 🐍 🦎 🦖 🐙 🦑 🦐 🦀 🐡 🐠 🐟 🐬 🐳 🐊 🐆 🦓 🦍 🐘 🦛 🐪 🦒 🦘 🐕 🐩 🌵 🎄 🌲 🌴 🌱 🌿 ☘️ 🍀 🎋 🍃 🍂 🍁 🌺 🌸 🌼 🌻 🌞 🌝 🌚 🌙 ⭐ 🌟 ✨ ⚡ ☄️ 🔥 🌈 ☀️ ⛅ ☁️ 🌧️ ⛈️ ❄️ 🌊".split(" "),
    },
    {
        key: "food", label: "Food & Drink", icon: <MdOutlineFastfood size={16} />,
        emojis: "🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🧀 🥚 🍳 🧇 🥞 🧈 🍗 🍖 🍕 🌭 🍔 🍟 🥪 🌮 🌯 🥙 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🧂 🥤 🧃 ☕ 🍵 🧋 🍺 🍻 🥂 🍷 🥃 🍸".split(" "),
    },
    {
        key: "travel", label: "Travel & Places", icon: <MdOutlineDirectionsCar size={16} />,
        emojis: "🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🛵 🏍️ 🛺 🚲 🛴 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 ✈️ 🛫 🛬 🛩️ 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥️ 🛳️ ⛴️ 🚢 ⚓ 🗺️ 🗿 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢 🎠 ⛲ ⛱️ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏔️ 🗻 🏕️ ⛺ 🏠 🏡 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛️ ⛪ 🕌 🕍".split(" "),
    },
    {
        key: "objects", label: "Objects", icon: <MdOutlineLightbulb size={16} />,
        emojis: "⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🖱️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📞 ☎️ 📟 📠 📺 📻 🎙️ ⏱️ ⏰ 🕰️ ⏳ 📡 🔋 🔌 💡 🔦 🕯️ 🧯 🛢️ 💸 💵 💰 💳 💎 ⚖️ 🔧 🔨 ⚒️ 🛠️ ⛏️ 🔩 ⚙️ 🧱 ⛓️ 🧲 🔫 💣 🧨 🔪 🗡️ 🛡️ 🚬 ⚰️ 🔮 📿 🧿 💈 ⚗️ 🔭 🔬 🕳️ 💊 💉 🩺 🧬 🦠 🧪 🌡️ 🧹 🧺 🧻 🚽 🚿 🛁 🧼 🪒 🧽 🔑 🗝️ 🚪 🛋️ 🛏️ 🖼️ 🛍️ 🎁 🎈 🎉 🎊".split(" "),
    },
    {
        key: "symbols", label: "Symbols", icon: <MdOutlineEmojiSymbols size={16} />,
        emojis: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 ✅ ❌ ⭕ 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🔶 🔷 🔸 🔹 ▪️ ▫️ 🔺 🔻 💠 🔘 🔳 🔲 ⚠️ 🚫 ♻️ 🆗 🆒 🆕 🆓 🔝 🔙 🔜 ℹ️ 🔅 🔆 〽️ ⚜️ 🔱 📛 🔰 ⭕ ✔️ ☑️ ✖️ ➕ ➖ ➗ 💲 💱 ™️ ©️ ®️ 〰️ ➰ ➿ 🔚 🔛 🔃 🔄 🔀 🔁 🔂 ▶️ ⏸️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ 🔼 🔽 ⬆️ ⬇️ ⬅️ ➡️ ↗️ ↘️".split(" "),
    },
];

const RECENT_KEY = "ccn-chat-recent-emojis";

function loadRecent(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(RECENT_KEY);
        return raw ? (JSON.parse(raw) as string[]).slice(0, 32) : [];
    } catch {
        return [];
    }
}

export function pushRecentEmoji(emoji: string) {
    if (typeof window === "undefined") return;
    try {
        const next = [emoji, ...loadRecent().filter((e) => e !== emoji)].slice(0, 32);
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
        /* storage unavailable — recents are non-critical */
    }
}

export default function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
    const [tab, setTab] = useState("smileys");
    const [query, setQuery] = useState("");
    const [recent, setRecent] = useState<string[]>(() => loadRecent());

    const tabs = useMemo(
        () => [{ key: "recent", label: "Recent", icon: <MdAccessTime size={16} />, emojis: recent }, ...GROUPS],
        [recent],
    );

    const active = tabs.find((t) => t.key === tab) ?? tabs[1];
    const list = query.trim()
        ? GROUPS.filter((g) => g.label.toLowerCase().includes(query.trim().toLowerCase())).flatMap((g) => g.emojis)
        : active.emojis;

    const handlePick = (emoji: string) => {
        pushRecentEmoji(emoji);
        setRecent(loadRecent());
        onPick(emoji);
    };

    return (
        <Box sx={{ width: 312, background: C.panelSolid, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1.2, py: 0.8, borderBottom: `1px solid ${C.borderSoft}` }}>
                <MdSearch size={15} color={C.textMuted} />
                <InputBase
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search category"
                    sx={{ fontSize: "0.72rem", color: C.text, flex: 1 }}
                />
            </Box>

            <Box sx={{ display: "flex", borderBottom: `1px solid ${C.borderSoft}` }}>
                {tabs.map((t) => (
                    <Tooltip key={t.key} title={t.label} arrow>
                        <Box
                            onClick={() => { setTab(t.key); setQuery(""); }}
                            sx={{
                                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                                py: 0.7, cursor: "pointer",
                                color: active.key === t.key ? C.accentSoft : C.textMuted,
                                borderBottom: `2px solid ${active.key === t.key ? C.accent : "transparent"}`,
                                "&:hover": { color: C.text },
                            }}
                        >
                            {t.icon}
                        </Box>
                    </Tooltip>
                ))}
            </Box>

            <Box sx={{ maxHeight: 232, overflowY: "auto", p: 1, ...scrollbarSx }}>
                {list.length === 0 ? (
                    <Typography sx={{ fontSize: "0.72rem", color: C.textMuted, textAlign: "center", py: 3 }}>
                        Nothing here yet
                    </Typography>
                ) : (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 0.2 }}>
                        {list.map((emoji, i) => (
                            <motion.button
                                key={`${emoji}-${i}`}
                                type="button"
                                whileHover={{ scale: 1.25 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handlePick(emoji)}
                                style={{
                                    background: "transparent", border: "none", cursor: "pointer",
                                    fontSize: "19px", lineHeight: "30px", height: 30, padding: 0,
                                }}
                            >
                                {emoji}
                            </motion.button>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
