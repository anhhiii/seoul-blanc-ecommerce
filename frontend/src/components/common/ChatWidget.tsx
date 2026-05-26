import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

const FAQS = [
  {
    q: "Chính sách đổi trả hàng như thế nào?",
    a: "Seoul Blanc hỗ trợ đổi hàng trong vòng 30 ngày kể từ ngày nhận hàng thành công đối với sản phẩm còn nguyên tem mác, chưa qua sử dụng. Bạn có thể yêu cầu Trả hàng / Hoàn tiền trực tiếp tại mục Lịch sử đơn hàng."
  },
  {
    q: "Làm sao để áp dụng mã giảm giá?",
    a: "Tại trang Thanh toán, bạn có thể xem các mã giảm giá khả dụng trong ví voucher hoặc nhập trực tiếp mã code vào ô nhập mã giảm giá rồi nhấn nút 'Áp dụng'."
  },
  {
    q: "Thời gian vận chuyển mất bao lâu?",
    a: "Đơn hàng nội thành Hà Nội & TP.HCM sẽ được giao trong 1-2 ngày. Các khu vực tỉnh thành khác từ 3-5 ngày làm việc."
  },
  {
    q: "Liên hệ Hotline hỗ trợ trực tiếp?",
    a: "Bạn có thể gọi trực tiếp Hotline CSKH của Seoul Blanc tại số 1900 8888 hoặc gửi email tới support@seoulblanc.com (Hoạt động 8:00 - 22:00)."
  }
];

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Xin chào! Seoul Blanc có thể hỗ trợ gì cho bạn hôm nay? Dưới đây là một số câu hỏi thường gặp:',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (text: string, sender: 'bot' | 'user' = 'user') => {
    const newMessage: ChatMessage = {
      sender,
      text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = inputValue.trim();
    if (!txt) return;

    handleSendMessage(txt, 'user');
    setInputValue('');

    // Simulated reply
    setTimeout(() => {
      handleSendMessage(
        'Cảm ơn bạn đã gửi tin nhắn. Đội ngũ CSKH của chúng tôi đã ghi nhận và sẽ phản hồi sớm nhất có thể qua email của bạn.',
        'bot'
      );
    }, 1000);
  };

  const handleFaqClick = (faq: typeof FAQS[0]) => {
    handleSendMessage(faq.q, 'user');
    setTimeout(() => {
      handleSendMessage(faq.a, 'bot');
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-brand-950 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-850 hover:scale-105 transition-all cursor-pointer animate-pulse border-none"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white border border-brand-200/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-brand-950 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                SB
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-wider">Seoul Blanc Assistant</h4>
                <span className="text-[9px] text-emerald-400 font-medium block">Đang trực tuyến</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-brand-50/15">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                  msg.sender === 'user' ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-700 border border-brand-200'
                }`}>
                  {msg.sender === 'user' ? <User size={12} /> : 'SB'}
                </div>
                <div className="space-y-1 max-w-[70%] text-left">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-900 text-white rounded-tr-none'
                      : 'bg-white text-brand-900 border border-brand-200/40 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-brand-400 font-light block">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Render FAQ options when bot is greeting */}
            {messages.length === 1 && (
              <div className="pl-[34px] space-y-2 text-left">
                {FAQS.map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFaqClick(faq)}
                    className="block w-full text-left p-2.5 bg-white hover:bg-brand-50 border border-brand-200/60 rounded-xl text-[10px] text-brand-700 transition-all font-medium cursor-pointer"
                  >
                    {faq.q}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleInputSubmit} className="p-3 bg-white border-t border-brand-100 flex gap-2">
            <input
              type="text"
              placeholder="Nhập nội dung cần hỗ trợ..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-2 bg-brand-50/20 border border-brand-200 rounded-full text-xs text-brand-900 focus:outline-none focus:border-brand-400 placeholder:text-brand-400 font-light"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center hover:bg-brand-850 transition-colors disabled:opacity-40 cursor-pointer border-none"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
