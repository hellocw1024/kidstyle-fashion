
import React from 'react';
import { HelpCircle, PlayCircle, MessageSquare, Phone, ChevronRight } from 'lucide-react';

const HelpCenter: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
       <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-gray-800 mb-4">帮助中心</h1>
          <p className="text-gray-400">解答您的疑问，助力您的创意落地</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <section className="space-y-4">
             <h2 className="text-xl font-bold flex items-center space-x-2">
                <HelpCircle className="text-rose-500" />
                <span>常见问题 FAQ</span>
             </h2>
             <div className="space-y-2">
                {[
                  "配额消耗规则是怎样的？",
                  "图片生成失败会扣配额吗？",
                  "充值后多久配额到账？",
                  "生成的图片版权归谁？",
                  "支持哪些图片比例？"
                ].map(q => (
                  <button key={q} className="w-full text-left p-4 bg-white border rounded-2xl flex items-center justify-between group hover:border-rose-300 hover:bg-rose-50/50 transition-all">
                    <span className="text-sm font-medium text-gray-700">{q}</span>
                    <ChevronRight className="text-gray-300 group-hover:text-rose-500" size={16} />
                  </button>
                ))}
             </div>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-bold flex items-center space-x-2">
                <PlayCircle className="text-blue-500" />
                <span>视频教程</span>
             </h2>
             <div className="aspect-video bg-gray-100 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center">
                   <PlayCircle className="text-gray-400 mx-auto mb-2" size={48} />
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">快速上手指南</p>
                </div>
             </div>
             <p className="text-xs text-gray-500 text-center">3分钟学会如何生成商业大片</p>
          </section>
       </div>

       <div className="bg-gray-800 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-[100px] rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="max-w-md">
                <h3 className="text-2xl font-black mb-4">需要更多帮助？</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">我们的客服团队随时待命，为您处理充值异常、技术故障或提供个性化方案建议。</p>
                <div className="flex flex-wrap gap-4">
                   <button className="px-6 py-3 bg-rose-500 rounded-xl font-bold flex items-center space-x-2 hover:bg-rose-600 transition-colors">
                      <MessageSquare size={18} />
                      <span>在线客服 (微信)</span>
                   </button>
                   <button className="px-6 py-3 bg-white/10 rounded-xl font-bold flex items-center space-x-2 hover:bg-white/20 transition-colors">
                      <Phone size={18} />
                      <span>咨询热线</span>
                   </button>
                </div>
             </div>
             <div className="w-40 h-40 bg-white p-2 rounded-3xl">
                <img src="https://picsum.photos/200/200?random=qr" alt="Customer Service QR" className="w-full h-full object-cover rounded-2xl" />
             </div>
          </div>
       </div>
    </div>
  );
};

export default HelpCenter;
