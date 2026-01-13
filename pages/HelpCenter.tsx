
import React from 'react';
import { HelpCircle, PlayCircle, MessageSquare, Phone, ChevronRight, Wand2 } from 'lucide-react';

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
               <div className="space-y-4">
                  {[
                     {
                        q: "1. 底图上传有什么具体要求？",
                        a: "为达到最佳商用效果，建议使用 4K 分辨率拍摄。模特背景应尽可能干净（推荐影棚白或浅灰）。姿态方面，双臂自然下垂或微张，避免遮挡躯干的核心结构线，这有助于 AI 精准还原服装褶皱与垂坠感。"
                     },
                     {
                        q: "2. 图片生成耗时及配额规则？",
                        a: "我们的计算集群根据分辨率动态分配资源：1K 全速模式（约 8-10s）消耗 1 配额；2K 精细模式（约 25-30s）消耗 2 配额；4K 顶级商业制版模式（约 60s）消耗 5 配额。高并发时段可能略有延迟。"
                     },
                     {
                        q: "3. 生成图的商用版权归属？",
                        a: "根据 KidStyle 用户协议，您通过 AI 引擎生成的每一张图片，其知识产权及商用权完全归属于您的账户主体。您可以自由用于电商详情页、户外大牌广告及全球社交媒体投放，无需额外支付授权费。"
                     },
                     {
                        q: "4. 如何解决 AI 生成的肢体畸形问题？",
                        a: "若出现手指或肢体不自然，通常是因为上传底图的模特姿势过于复杂（如同方向遮叠）。建议开启“深度配置”下的“姿势修正”选项，或在 Prompt 中补充 'perfect hands, detailed fingers' 等关键词。"
                     },
                     {
                        q: "5. 支持哪些服装品类的渲染？",
                        a: "目前针对童装（3-14岁）的 T 恤、衬衫、卫衣、连衣裙、羽绒服进行了深度优化。对于复杂的镂空刺绣或高反光材质（如亮片），建议提高采样步数 (Steps) 并使用 4K 导出。"
                     }
                  ].map((item, idx) => (
                     <div key={idx} className="w-full text-left p-6 bg-white border border-gray-100 rounded-[2rem] group hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-100/30 transition-all duration-500">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-sm font-black text-gray-800 tracking-tight">{item.q}</span>
                           <ChevronRight className="text-gray-300 group-hover:text-rose-500 transition-transform group-hover:rotate-90" size={16} />
                        </div>
                        <p className="text-xs text-gray-500 leading-loose opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden transition-all duration-500 ease-out">{item.a}</p>
                     </div>
                  ))}
               </div>
            </section>

            <section className="space-y-6">
               <h2 className="text-xl font-bold flex items-center space-x-2">
                  <PlayCircle className="text-blue-500" />
                  <span>视频教程 Tutorials</span>
               </h2>
               <div className="grid grid-cols-1 gap-4">
                  {[
                     { title: "3分钟上手：AI 换装全流程", duration: "03:15", thumb: "https://picsum.photos/400/225?random=t1" },
                     { title: "进阶：如何拍出完美的底图", duration: "05:20", thumb: "https://picsum.photos/400/225?random=t2" },
                     { title: "商业制版：4K 模式深度解析", duration: "04:45", thumb: "https://picsum.photos/400/225?random=t3" }
                  ].map((vid, idx) => (
                     <div key={idx} className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-gray-100 hover:border-blue-400 transition-all group cursor-pointer shadow-sm hover:shadow-xl">
                        <img src={vid.thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={vid.title} />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                           <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-125 group-hover:bg-rose-500 transition-all">
                              <PlayCircle className="text-white fill-white" size={24} />
                           </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                           <p className="text-xs font-black truncate">{vid.title}</p>
                           <p className="text-[10px] opacity-70 mt-1">{vid.duration}</p>
                        </div>
                     </div>
                  ))}
               </div>

               <div className="bg-gradient-to-br from-rose-50 to-blue-50 rounded-[2rem] p-8 border border-white shadow-inner">
                  <div className="flex items-start space-x-4">
                     <div className="p-3 bg-white rounded-2xl shadow-sm"><Wand2 className="text-rose-500" size={24} /></div>
                     <div>
                        <h4 className="text-sm font-black text-gray-800">专业指导：底图选择技巧</h4>
                        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                           相比于复杂的实景拍摄，<b>纯净的影棚背景</b>能让 Gemini 视觉引擎更精准地剥离像素边缘。
                           在 4K 商业模式下，这种背景能显著减少服装边缘的伪影，确保每一个线头都清晰可见。
                        </p>
                     </div>
                  </div>
               </div>
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
