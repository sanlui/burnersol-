import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, MessageSquare, Trash, RefreshCw, Flame, User } from "lucide-react";
import { TranslationSet } from "../utils/translations";

interface CombustionAssistantProps {
  t: TranslationSet;
  language: string;
}

export default function CombustionAssistant({ t, language }: CombustionAssistantProps) {
  // Multilingual dynamic greeting
  const getWelcomeMessage = (lang: string) => {
    switch (lang) {
      case "it":
        return "🔥 Scintille e fiamme! Sono Cinder, il tuo assistente per la combustione qui su BurnerSol! Mangio spazzatura digitale a colazione, pranzo e cena, e sputo SOL freschi di recupero! Dimmi, Scrappy, hai dei token scam o degli NFT inutilizzabili che ti intasano il wallet? Chiedimi come incenerirli! 🔥";
      case "es":
        return "🔥 ¡Chispas y llamas! ¡Soy Cinder, el asistente de combustión de BurnerSol! Como basura digital en el desayuno, almuerzo y cena, ¡y devuelvo SOL líquidos! Dime Scrappy, ¿tienes tokens basura o NFT inútiles en tu billetera? ¡Pregúntame cómo purgarlos! 🔥";
      case "zh":
        return "🔥 火光四射！我是 Cinder，BurnerSol 的智能销毁助手！我早中晚都在吞食链上垃圾账户，并为您吐出真金白银的 SOL 空间租金！兄弟，你钱包里有垃圾欺诈代币或无用的 NFT 插槽吗？快来向我请教如何清理它们吧！🔥";
      case "ja":
        return "🔥 炎と火花！BurnerSolの専属バーンアシスタント、Cinderです！デジタルゴミを朝昼晩と貪り、新鮮な解放SOLを吐き出します！なぁ、キミのウォレットに不要なスキャムやNFTアドレスは眠ってないかい？消去方法について何でも聞いてね！🔥";
      case "de":
        return "🔥 Funken und Flammen! Ich bin Cinder, dein Verbrennungsassistent hier bei BurnerSol! Ich fresse digitalen Müll morgens, mittags und abends und spucke reines SOL aus! Sag mir, Scrappy – hast du Betrugs-Token oder ungenutzte NFTs im Wallet? Frag mich, wie man sie einschmilzt! 🔥";
      case "fr":
        return "🔥 Étincelles et flammes ! Je suis Cinder, ton assistant de combustion attitré chez BurnerSol ! Je dévore les déchets numériques et recrache du SOL liquide tout frais ! Dis-moi, as-tu des jetons d'escroquerie ou des NFT inutiles qui encombrent ton portefeuille ? Demande-moi comment les liquider ! 🔥";
      case "ru":
        return "🔥 Искры и пламя! Я Cinder, ваш ИИ-помощник по сжиганию мусора в BurnerSol! Я ем цифровой мусор на завтрак, обед и ужин и возвращаю вам чистый SOL! Скажи, Scrappy — у тебя накопились скам-токены или ненужные NFT? Спроси меня, как их стереть! 🔥";
      default:
        return "🔥 Sparks and flames! I'm Cinder, the resident combustion assistant here at BurnerSol! I eat digital garbage for breakfast, lunch, and dinner, and spit out shiny reclaimed SOL! Tell me Scrappy—got some nasty scam tokens or useless NFTs clogging your wallet? Ask me how to melt them! 🔥";
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: getWelcomeMessage(language),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Reset welcome message on language change for immediate user feedback
  useEffect(() => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: "assistant",
        content: getWelcomeMessage(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [language]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Strict client-side sanitization to prevent XSS script injections
    const sanitizedText = textToSend
      .replace(/<[^>]*>/g, "")
      .slice(0, 1000);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: sanitizedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.text || "💥 Cinder got tongue-tied in the furnace! No response text found.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error("Failed to query Cinder bot:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "💥 *A loud explosion echoes* Sputter! I sneezed too much rocket fuel and lost connection to the server. Try again in a second!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: "assistant",
        content: getWelcomeMessage(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const getSuggestedPrompts = (lang: string) => {
    switch (lang) {
      case "it":
        return [
          { label: "Cos'è la Rent su Solana?", prompt: "Puoi spiegarmi come funziona la rendita/rent su Solana e perché ottengo SOL indietro quando chiudo account?" },
          { label: "Racconta una barzelletta meme", prompt: "Raccontami una barzelletta divertente e spietata sui meme coin buyer o rugpull!" },
          { label: "È sicuro da usare?", prompt: "È sicuro chiudere questi conti token o NFT? Posso rischiare di perdere i miei veri SOL?" }
        ];
      case "es":
        return [
          { label: "¿Qué es la Rent de Solana?", prompt: "¿Puedes explicar cómo funciona el alquiler (rent) de Solana y por qué recupero SOL?" },
          { label: "Chiste de Cripto Memes", prompt: "¡Cuéntame un chiste brutal y divertido sobre compradores de monedas meme!" },
          { label: "¿Es 100% seguro de usar?", prompt: "¿Es seguro cerrar cuentas de tokens? ¿Puedo perder mis SOL legítimos?" }
        ];
      case "zh":
        return [
          { label: "什么是 Solana 空间租金？", prompt: "您能解释一下 Solana 租金免除机制吗？为什么销毁账户能拿回 SOL？" },
          { label: "讲个币圈土狗笑话", prompt: "给我讲个关于买山寨币被割韭菜的无情币圈笑话！" },
          { label: "清理插槽安全吗？", prompt: "关闭代币插槽安全吗？这会不会让我丢失账户里的真实主网代币？" }
        ];
      case "ja":
        return [
          { label: "Solanaのレント（賃貸）とは？", prompt: "Solanaのレント免除の仕組みとは何ですか？アドレス終了でSOLが返還される理由を教えてください。" },
          { label: "ミームコイン狂想曲のジョーク", prompt: "芝犬ミームコインや草ハッシュタグの爆死にまつわる面白い裏話を教えて！" },
          { label: "ウォレット閉鎖は安全？", prompt: "孤立チャネルをクローズするのは安全ですか？メインのSOL残高が失われるリスクは？" }
        ];
      default:
        return [
          { label: "What is Solana Rent?", prompt: "Can you explain how Solana rent works and why I get SOL back when I burn items?" },
          { label: "Tell a Meme Joke", prompt: "Tell me a hilariously brutal joke about meme coin buyers and rugpulls!" },
          { label: "Is it safe to use?", prompt: "Is it safe to close these token or NFT accounts? Can I lose my actual SOL tokens?" }
        ];
    }
  };

  const SUGGESTED_PROMPTS = getSuggestedPrompts(language);

  return (
    <div className="w-full glass-panel border border-white/10 rounded-none overflow-hidden flex flex-col h-full bg-[#030303]">
      {/* Bot Chat Header */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-flame-coral/10 border border-flame-coral/30 rounded-none animate-pulse-glow">
              <Flame className="w-4 h-4 text-flame-coral fill-flame-coral/20" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-none bg-emerald-500 border border-black" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold italic text-white tracking-widest uppercase text-xs">
              {t.aiTitle}
            </h3>
            <p className="text-[9px] text-slate-500 font-mono tracking-wider">
              {t.aiEngine}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-none border border-white/10 hover:border-red-400/30 text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300 cursor-pointer"
          title="Clear Chat History"
        >
          <Trash className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] max-h-[380px] bg-black/45">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div className={`p-2 rounded-none text-xs leading-none border shrink-0 ${
              msg.role === "user" 
                ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
                : "bg-flame-coral/10 border-flame-coral/20 text-flame-coral"
            }`}>
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble */}
            <div className={`p-3.5 rounded-none flex flex-col gap-1 ${
              msg.role === "user"
                ? "bg-purple-500/5 border border-purple-500/10 text-right"
                : "bg-white/[0.02] border border-white/5"
            }`}>
              <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-text text-left">
                {msg.content}
              </p>
              <span className="text-[9px] text-slate-500 font-mono self-end pt-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-none bg-flame-coral/10 border border-flame-coral/20 text-flame-coral shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-flame-coral rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-flame-coral rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-flame-coral rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2 border-t border-b border-white/[0.03] bg-black/20 flex flex-wrap gap-1.5 justify-start">
        {SUGGESTED_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(item.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono text-slate-400 hover:text-flame-orange hover:bg-flame-orange/[0.03] border border-white/5 hover:border-flame-orange/20 rounded-none transition-all duration-300 disabled:opacity-45 cursor-pointer text-left"
          >
            <MessageSquare className="w-2.5 h-2.5 text-slate-500 shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Reply input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-4 bg-black/60 border-t border-white/10 flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          placeholder={t.aiPlaceholder}
          className="flex-1 bg-white/[0.02] border border-white/10 rounded-none px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-flame-coral/40"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-3.5 rounded-none bg-flame-orange text-white hover:bg-orange-600 disabled:opacity-35 transition-all duration-300 cursor-pointer"
        >
          <Send className="w-4 h-4 text-white stroke-[2.5px]" />
        </button>
      </form>
    </div>
  );
}
